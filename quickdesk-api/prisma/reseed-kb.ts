import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Re-seeding AI Knowledge Base...\n');

  // ── 1. Delete all existing chunks ────────────────────────────────────────────
  const deleted = await prisma.knowledgeChunk.deleteMany();
  console.log(`  🗑️  Deleted ${deleted.count} existing knowledge chunks`);

  // ── 2. Read markdown files from kb/ ──────────────────────────────────────────
  const kbDir = path.join(process.cwd(), 'kb');
  if (!fs.existsSync(kbDir)) {
    console.error('  ❌ Knowledge base directory not found at:', kbDir);
    process.exit(1);
  }

  const files = fs.readdirSync(kbDir).filter((f: string) => f.endsWith('.md'));
  if (files.length === 0) {
    console.log('  ⚠️  No .md files found in kb/ directory');
    return;
  }
  console.log(`  📂 Found ${files.length} markdown files\n`);

  // ── 3. Load the embedding model ─────────────────────────────────────────────
  console.log('  ⏳ Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
  const transformers = await import('@xenova/transformers');
  const extractor = await transformers.pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    { quantized: true },
  );
  console.log('  ✅ Model loaded\n');

  // ── 4. Process each file ────────────────────────────────────────────────────
  let totalChunks = 0;

  for (const file of files) {
    const filePath = path.join(kbDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const paragraphs = content.split(/\n\s*\n/);

    let fileChunks = 0;
    for (const p of paragraphs) {
      const text = p.trim();
      if (text.length > 20) {
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        const vector = Array.from(output.data);

        await prisma.$executeRaw`
          INSERT INTO "KnowledgeChunk" (id, content, source, embedding)
          VALUES (gen_random_uuid()::text, ${text}, ${file}, ${vector}::vector)
        `;
        fileChunks++;
      }
    }

    totalChunks += fileChunks;
    console.log(`  📄 ${file} → ${fileChunks} chunks`);
  }

  console.log(`\n✅ Re-seed complete — ${totalChunks} knowledge chunks inserted.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
