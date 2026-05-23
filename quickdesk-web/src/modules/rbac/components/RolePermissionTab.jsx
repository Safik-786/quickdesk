import { useState, useEffect } from 'react';
import { useRoles, useGroupedPermissions, useRolePermissions, useSyncPermissions } from '../rbac.hooks';
import Button from '../../core/components/ui/Button';

const ACTIONS = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'];

const ShieldCheckbox = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`focus:outline-none transition-transform flex items-center justify-center w-8 h-8 rounded-full ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-pointer hover:bg-gray-100 active:scale-90'
      }`}
    title={checked ? "Granted" : "Denied"}
  >
    <svg
      width="20"
      height="22"
      viewBox="0 0 24 24"
      fill={checked ? "#2563eb" : "none"}
      stroke={checked ? "#2563eb" : "#d1d5db"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-colors duration-200"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {checked && <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" />}
    </svg>
  </button>
);

export default function RolePermissionTab() {
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const { data: groupedPermissions = {}, isLoading: isLoadingPerms } = useGroupedPermissions();
  const { data: rolePermissions = [], isLoading: isLoadingRolePerms } = useRolePermissions(selectedRoleId);

  const syncPermissions = useSyncPermissions();
  const [pendingPermissions, setPendingPermissions] = useState([]);

  // Sync local state when rolePermissions data loads
  useEffect(() => {
    setPendingPermissions(rolePermissions.map(rp => rp.id));
  }, [rolePermissions, selectedRoleId]);

  // On mount or when roles load, select the first role if none is selected
  if (!selectedRoleId && roles.length > 0) {
    setSelectedRoleId(roles[0].id);
  }

  const handleToggle = (permissionId, currentlyAssigned) => {
    if (!selectedRoleId) return;
    setPendingPermissions(prev =>
      currentlyAssigned
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    await syncPermissions.mutateAsync({
      roleId: selectedRoleId,
      permissionIds: pendingPermissions
    });
  };

  const isAssigned = (permissionId) => {
    return pendingPermissions.includes(permissionId);
  };

  const hasUnsavedChanges =
    pendingPermissions.length !== rolePermissions.length ||
    !pendingPermissions.every(id => rolePermissions.some(rp => rp.id === id));

  if (isLoadingRoles || isLoadingPerms) {
    return <div className="p-8 text-center text-gray-500">Loading RBAC data...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Column: Roles */}
      <div className="w-full md:w-1/4 flex flex-col space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Roles</h3>
        <ul className="space-y-1">
          {roles.map(role => (
            <li key={role.id}>
              <button
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ${selectedRoleId === role.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-slate-200'
                  }`}
              >
                <div className={`font-medium ${selectedRoleId === role.id ? 'text-blue-700' : 'text-gray-900'}`}>
                  {role.name}
                </div>
                {role.description && (
                  <div className={`text-xs mt-1 ${selectedRoleId === role.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {role.description}
                  </div>
                )}
                {role.isSystem && (
                  <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800">
                    System
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: Permissions */}
      <div className="w-full md:w-3/4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Permissions Matrix
            {selectedRoleId && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({roles.find(r => r.id === selectedRoleId)?.name})
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            {isLoadingRolePerms && <span className="text-sm text-gray-400">Loading...</span>}
            <Button
              onClick={handleSave}
              isLoading={syncPermissions.isPending}
              isDisabled={!hasUnsavedChanges || isLoadingRolePerms}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/4">
                    Module
                  </th>
                  {ACTIONS.map(action => (
                    <th key={action} scope="col" className="px-2 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
                  return (
                    <tr key={moduleName} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {moduleName}
                      </td>
                      {ACTIONS.map(action => {
                        // Find if there's a permission ending in .ACTION (e.g., USER.CREATE)
                        const perm = permissions.find(p => p.code.toUpperCase().endsWith(`.${action}`));

                        return (
                          <td key={action} className="px-2 py-4 whitespace-nowrap text-center">
                            {perm ? (
                              <div className="flex justify-center">
                                <ShieldCheckbox
                                  checked={isAssigned(perm.id)}
                                  onChange={() => handleToggle(perm.id, isAssigned(perm.id))}
                                  disabled={!selectedRoleId || syncPermissions.isPending}
                                />
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end text-sm text-gray-500">
          <div className="flex items-center space-x-2 mr-4">
            <ShieldCheckbox checked={true} onChange={() => { }} disabled={true} />
            <span>Granted</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckbox checked={false} onChange={() => { }} disabled={true} />
            <span>Denied</span>
          </div>
        </div>
      </div>
    </div>
  );
}
