export function parseMarkdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Normalize line endings
  let lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let html = [];
  let inList = null; // 'ul', 'ol', 'blockquote', or null
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();
    
    // Horizontal Rules
    if (trimmed === '---' || trimmed === '***') {
      if (inList) { html.push(`</${inList}>`); inList = null; }
      html.push('<hr class="my-4 border-slate-200" />');
      continue;
    }
    
    // Blockquotes
    if (trimmed.startsWith('>')) {
      if (inList && inList !== 'blockquote') { html.push(`</${inList}>`); inList = null; }
      if (!inList) {
        html.push('<blockquote class="border-l-4 border-indigo-500 pl-4 py-1 my-2 text-gray-600 bg-slate-50/80 rounded-r-md italic">');
        inList = 'blockquote';
      }
      let content = trimmed.substring(1).trim();
      html.push(`<p>${parseInlineMarkdown(content)}</p>`);
      continue;
    }
    
    // Headings
    if (trimmed.startsWith('### ')) {
      if (inList) { html.push(`</${inList}>`); inList = null; }
      html.push(`<h3 class="text-base font-bold text-slate-900 mt-4 mb-1.5">${parseInlineMarkdown(trimmed.substring(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { html.push(`</${inList}>`); inList = null; }
      html.push(`<h2 class="text-lg font-bold text-slate-900 mt-5 mb-2">${parseInlineMarkdown(trimmed.substring(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      if (inList) { html.push(`</${inList}>`); inList = null; }
      html.push(`<h1 class="text-xl font-bold text-slate-900 mt-6 mb-3">${parseInlineMarkdown(trimmed.substring(2))}</h1>`);
      continue;
    }
    
    // Unordered Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (inList && inList !== 'ul') { html.push(`</${inList}>`); inList = null; }
      if (!inList) {
        html.push('<ul class="list-disc list-inside space-y-1 my-2 text-slate-700 pl-4">');
        inList = 'ul';
      }
      let content = trimmed.substring(2);
      html.push(`<li>${parseInlineMarkdown(content)}</li>`);
      continue;
    }
    
    // Ordered Lists
    let olMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      if (inList && inList !== 'ol') { html.push(`</${inList}>`); inList = null; }
      if (!inList) {
        html.push('<ol class="list-decimal list-inside space-y-1 my-2 text-slate-700 pl-4">');
        inList = 'ol';
      }
      let content = olMatch[2];
      html.push(`<li>${parseInlineMarkdown(content)}</li>`);
      continue;
    }
    
    // Blank Lines
    if (trimmed === '') {
      if (inList) { html.push(`</${inList}>`); inList = null; }
      continue;
    }
    
    // Standard Paragraph
    if (inList) { html.push(`</${inList}>`); inList = null; }
    html.push(`<p class="text-slate-700 leading-relaxed mb-3.5">${parseInlineMarkdown(trimmed)}</p>`);
  }
  
  if (inList) {
    html.push(`</${inList}>`);
  }
  
  return html.join('\n');
}

function parseInlineMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-xs border border-slate-200">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-indigo-600 hover:text-indigo-800 underline">$1</a>');
}
