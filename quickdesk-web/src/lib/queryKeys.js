/**
 * Centralized query key factory.
 * Keeps cache invalidation consistent across the app.
 */
export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'],
  },

  // Tickets
  tickets: {
    all: () => ['tickets'],
    lists: () => ['tickets', 'list'],
    list: (filters) => ['tickets', 'list', filters],
    mine: () => ['tickets', 'mine'],
    detail: (id) => ['tickets', 'detail', id],
    draft: (id) => ['tickets', 'draft', id],
  },

  // Metrics
  metrics: {
    summary: () => ['metrics', 'summary'],
  },

  // RBAC
  rbac: {
    // Permissions
    permissions: {
      all: () => ['rbac', 'permissions'],
      grouped: () => ['rbac', 'permissions', 'grouped'],
      detail: (id) => ['rbac', 'permissions', 'detail', id],
    },
    // Roles
    roles: {
      all: () => ['rbac', 'roles'],
      detail: (id) => ['rbac', 'roles', 'detail', id],
    },
    // User-role assignments
    users: {
      all: () => ['rbac', 'users'],
      roles: (userId) => ['rbac', 'users', userId, 'roles'],
    },
  },

  // Users
  users: {
    all: () => ['users'],
    detail: (id) => ['users', 'detail', id],
  },
};
