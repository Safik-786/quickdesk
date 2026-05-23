import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance as api } from '../../lib/axios';

// Users
export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      return await api.get(`/users?page=${page}&limit=${limit}`);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      return await api.post('/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, roleIds }) => {
      return await api.post(`/users/${userId}/roles`, { roleIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Roles
export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      return await api.get('/rbac/roles');
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleData) => {
      return await api.post('/rbac/roles', roleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

// Permissions
export function useGroupedPermissions() {
  return useQuery({
    queryKey: ['permissions', 'grouped'],
    queryFn: async () => {
      return await api.get('/rbac/permissions/grouped');
    },
  });
}

export function useRolePermissions(roleId) {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: async () => {
      return await api.get(`/rbac/roles/${roleId}/permissions`);
    },
    enabled: !!roleId,
  });
}

export function useSyncPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }) => {
      return await api.post(`/rbac/roles/${roleId}/permissions`, { permissionIds });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, 'permissions'] });
    },
  });
}
