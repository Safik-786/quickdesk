import { useState, useEffect } from 'react';
import { axiosInstance } from '../../../lib/axios';

export default function RolePermissionTab() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        axiosInstance.get('/rbac/roles'),
        axiosInstance.get('/rbac/permissions')
      ]);
      setRoles(rolesRes.data || []);
      setPermissions(permsRes.data || []);
      
      if (rolesRes.data && rolesRes.data.length > 0) {
        setSelectedRole(rolesRes.data[0]);
        fetchRolePermissions(rolesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      const res = await axiosInstance.get(`/rbac/roles/${roleId}/permissions`);
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: res.data || []
      }));
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (!rolePermissions[role.id]) {
      fetchRolePermissions(role.id);
    }
  };

  const togglePermission = (permissionId) => {
    if (!selectedRole) return;
    
    const current = rolePermissions[selectedRole.id] || [];
    const updated = current.some(p => p.id === permissionId)
      ? current.filter(p => p.id !== permissionId)
      : [...current, permissions.find(p => p.id === permissionId)];
    
    setRolePermissions(prev => ({
      ...prev,
      [selectedRole.id]: updated
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      const permissionIds = (rolePermissions[selectedRole.id] || []).map(p => p.id);
      
      await axiosInstance.post(`/rbac/roles/${selectedRole.id}/permissions`, {
        permissionIds
      });

      // Refresh role permissions
      await fetchRolePermissions(selectedRole.id);
    } catch (error) {
      console.error('Error saving permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  const currentRolePermissions = selectedRole ? (rolePermissions[selectedRole.id] || []) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Roles List - Left Side */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Roles</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedRole?.id === role.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedRole?.id === role.id ? 'bg-white' : 'bg-blue-600'}`}></div>
                  <span>{role.name}</span>
                </div>
                <div className={`text-xs mt-1 ${selectedRole?.id === role.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {currentRolePermissions.length || 0} permissions
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions - Right Side */}
      <div className="lg:col-span-2">
        {selectedRole ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedRole.name}</h3>
              <p className="text-sm text-gray-600">{selectedRole.description || 'No description'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Permissions</h4>
              
              {permissions.length === 0 ? (
                <p className="text-gray-500 text-sm">No permissions available</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {permissions.map(permission => {
                    const isChecked = currentRolePermissions.some(p => p.id === permission.id);
                    return (
                      <label key={permission.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(permission.id)}
                          className="w-5 h-5 text-blue-600 rounded mt-0.5 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{permission.name}</div>
                          {permission.description && (
                            <div className="text-xs text-gray-500 mt-0.5">{permission.description}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => fetchRolePermissions(selectedRole.id)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                Save Permissions
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 text-gray-500">
            <p>Select a role to view and manage permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
