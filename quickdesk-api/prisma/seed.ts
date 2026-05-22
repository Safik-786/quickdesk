import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── Permission definitions ───────────────────────────────────────────────────
const PERMISSIONS = [
  // USER module
  { module: 'USER', code: 'USER.CREATE',  name: 'Create User',   description: 'Create new user accounts' },
  { module: 'USER', code: 'USER.READ',    name: 'Read Users',    description: 'View user list and profiles' },
  { module: 'USER', code: 'USER.UPDATE',  name: 'Update User',   description: 'Edit user details' },
  { module: 'USER', code: 'USER.DELETE',  name: 'Delete User',   description: 'Delete user accounts' },
  { module: 'USER', code: 'USER.MANAGE',  name: 'Manage Users',  description: 'Full user management including role assignment' },

  // TICKET module
  { module: 'TICKET', code: 'TICKET.CREATE',  name: 'Create Ticket',  description: 'Submit new support tickets' },
  { module: 'TICKET', code: 'TICKET.READ',    name: 'Read Tickets',   description: 'View tickets' },
  { module: 'TICKET', code: 'TICKET.UPDATE',  name: 'Update Ticket',  description: 'Edit ticket details' },
  { module: 'TICKET', code: 'TICKET.DELETE',  name: 'Delete Ticket',  description: 'Delete tickets' },
  { module: 'TICKET', code: 'TICKET.MANAGE',  name: 'Manage Tickets', description: 'Full ticket management including resolve and override' },

  // TICKET_REPLY module
  { module: 'TICKET_REPLY', code: 'TICKET_REPLY.CREATE',  name: 'Reply to Ticket',    description: 'Send replies to tickets' },
  { module: 'TICKET_REPLY', code: 'TICKET_REPLY.READ',    name: 'Read Replies',       description: 'View ticket replies' },
  { module: 'TICKET_REPLY', code: 'TICKET_REPLY.UPDATE',  name: 'Update Reply',       description: 'Edit sent replies' },
  { module: 'TICKET_REPLY', code: 'TICKET_REPLY.DELETE',  name: 'Delete Reply',       description: 'Delete replies' },
  { module: 'TICKET_REPLY', code: 'TICKET_REPLY.MANAGE',  name: 'Manage Replies',     description: 'Full reply management' },

  // METRICS module
  { module: 'METRICS', code: 'METRICS.CREATE',  name: 'Create Metric',   description: 'Create metric entries' },
  { module: 'METRICS', code: 'METRICS.READ',    name: 'Read Metrics',    description: 'View analytics and metrics dashboard' },
  { module: 'METRICS', code: 'METRICS.UPDATE',  name: 'Update Metric',   description: 'Edit metric data' },
  { module: 'METRICS', code: 'METRICS.DELETE',  name: 'Delete Metric',   description: 'Delete metric data' },
  { module: 'METRICS', code: 'METRICS.MANAGE',  name: 'Manage Metrics',  description: 'Full metrics management' },

  // RBAC module
  { module: 'RBAC', code: 'RBAC.CREATE',  name: 'Create Role/Permission',  description: 'Create new roles and permissions' },
  { module: 'RBAC', code: 'RBAC.READ',    name: 'Read RBAC',               description: 'View roles and permissions' },
  { module: 'RBAC', code: 'RBAC.UPDATE',  name: 'Update Role/Permission',  description: 'Edit roles and permissions' },
  { module: 'RBAC', code: 'RBAC.DELETE',  name: 'Delete Role/Permission',  description: 'Delete roles and permissions' },
  { module: 'RBAC', code: 'RBAC.MANAGE',  name: 'Manage RBAC',             description: 'Assign roles to users and permissions to roles' },

  // AUDIT module
  { module: 'AUDIT', code: 'AUDIT.CREATE',  name: 'Create Audit Log',  description: 'Create audit entries' },
  { module: 'AUDIT', code: 'AUDIT.READ',    name: 'Read Audit Logs',   description: 'View audit trail' },
  { module: 'AUDIT', code: 'AUDIT.UPDATE',  name: 'Update Audit Log',  description: 'Edit audit entries' },
  { module: 'AUDIT', code: 'AUDIT.DELETE',  name: 'Delete Audit Log',  description: 'Delete audit entries' },
  { module: 'AUDIT', code: 'AUDIT.MANAGE',  name: 'Manage Audit',      description: 'Full audit log management' },

  // AI module
  { module: 'AI', code: 'AI.CREATE',  name: 'Trigger AI',       description: 'Trigger AI classification and drafts' },
  { module: 'AI', code: 'AI.READ',    name: 'Read AI Output',   description: 'View AI suggestions and drafts' },
  { module: 'AI', code: 'AI.UPDATE',  name: 'Update AI Config', description: 'Modify AI settings' },
  { module: 'AI', code: 'AI.DELETE',  name: 'Delete AI Data',   description: 'Remove AI-generated data' },
  { module: 'AI', code: 'AI.MANAGE',  name: 'Manage AI',        description: 'Full AI feature management' },
];

// ─── Role definitions ─────────────────────────────────────────────────────────
const ROLES = [
  {
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Full system access — all permissions',
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.code), // all
  },
  {
    name: 'Support Agent',
    code: 'AGENT',
    description: 'Can view all tickets, reply, resolve, and override AI suggestions',
    isSystem: true,
    permissions: [
      'TICKET.READ', 'TICKET.UPDATE', 'TICKET.MANAGE',
      'TICKET_REPLY.CREATE', 'TICKET_REPLY.READ', 'TICKET_REPLY.UPDATE',
      'METRICS.READ',
      'AUDIT.READ',
      'AI.READ', 'AI.CREATE',
      'USER.READ',
    ],
  },
  {
    name: 'Employee',
    code: 'EMPLOYEE',
    description: 'Can submit tickets and view their own tickets',
    isSystem: true,
    permissions: [
      'TICKET.CREATE', 'TICKET.READ',
      'TICKET_REPLY.READ',
    ],
  },
  {
    name: 'RBAC Manager',
    code: 'RBAC_MANAGER',
    description: 'Can manage roles, permissions, and user assignments',
    isSystem: false,
    permissions: [
      'RBAC.CREATE', 'RBAC.READ', 'RBAC.UPDATE', 'RBAC.DELETE', 'RBAC.MANAGE',
      'USER.READ',
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Upsert permissions ──────────────────────────────────────────────────────
  console.log('  Creating permissions...');
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, description: perm.description, module: perm.module },
      create: perm,
    });
  }
  console.log(`  ✅ ${PERMISSIONS.length} permissions seeded`);

  // ── Upsert roles ────────────────────────────────────────────────────────────
  console.log('  Creating roles...');
  for (const roleDef of ROLES) {
    const { permissions: permCodes, ...roleData } = roleDef;

    const role = await prisma.rbacRole.upsert({
      where: { code: roleData.code },
      update: { name: roleData.name, description: roleData.description },
      create: roleData,
    });

    // Sync permissions for this role
    const perms = await prisma.permission.findMany({
      where: { code: { in: permCodes } },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: perms.map((p) => ({ roleId: role.id, permissionId: p.id })),
      skipDuplicates: true,
    });

    console.log(`  ✅ Role "${role.name}" with ${perms.length} permissions`);
  }

  // ── Seed users ──────────────────────────────────────────────────────────────
  console.log('  Creating users...');
  const agentHash = await bcrypt.hash('agent123', 12);
  const employeeHash = await bcrypt.hash('employee123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@quickdesk.com' },
    update: {},
    create: {
      email: 'admin@quickdesk.com',
      name: 'System Admin',
      passwordHash: adminHash,
      legacyRole: 'admin',
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { email: 'agent@quickdesk.com' },
    update: {},
    create: {
      email: 'agent@quickdesk.com',
      name: 'Support Agent',
      passwordHash: agentHash,
      legacyRole: 'agent',
    },
  });

  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@quickdesk.com' },
    update: {},
    create: {
      email: 'employee@quickdesk.com',
      name: 'Jane Employee',
      passwordHash: employeeHash,
      legacyRole: 'employee',
    },
  });

  // ── Assign RBAC roles to users ──────────────────────────────────────────────
  const adminRole = await prisma.rbacRole.findUnique({ where: { code: 'ADMIN' } });
  const agentRole = await prisma.rbacRole.findUnique({ where: { code: 'AGENT' } });
  const employeeRole = await prisma.rbacRole.findUnique({ where: { code: 'EMPLOYEE' } });

  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }
  if (agentRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: agentUser.id, roleId: agentRole.id } },
      update: {},
      create: { userId: agentUser.id, roleId: agentRole.id },
    });
  }
  if (employeeRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: employeeUser.id, roleId: employeeRole.id } },
      update: {},
      create: { userId: employeeUser.id, roleId: employeeRole.id },
    });
  }

  console.log(`  ✅ admin@quickdesk.com  (password: admin123)`);
  console.log(`  ✅ agent@quickdesk.com  (password: agent123)`);
  console.log(`  ✅ employee@quickdesk.com  (password: employee123)`);
  console.log('\n✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
