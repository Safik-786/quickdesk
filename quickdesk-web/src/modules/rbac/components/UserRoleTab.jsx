import { useState } from 'react';
import { useUsers, useRoles, useCreateUser, useAssignRoles } from '../rbac.hooks';
import Button from '../../core/components/ui/Button';
import Slideover from '../../core/components/ui/Slideover';
import Input from '../../core/components/ui/Input';

function UserSlideover({ isOpen, onClose, selectedUser }) {
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const assignRoles = useAssignRoles();

  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Setup form when opened
  useState(() => {
    if (selectedUser) {
      setSelectedRoleIds(selectedUser.userRoles.map(ur => ur.roleId));
    } else {
      setForm({ email: '', name: '', password: '' });
      setSelectedRoleIds([]);
    }
  }, [isOpen, selectedUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      // Edit mode - just assigning roles
      await assignRoles.mutateAsync({ userId: selectedUser.id, roleIds: selectedRoleIds });
    } else {
      // Create mode
      await createUser.mutateAsync({ ...form, roleIds: selectedRoleIds });
    }
    onClose();
  };

  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const isPending = createUser.isPending || assignRoles.isPending;

  return (
    <Slideover
      isOpen={isOpen}
      onClose={onClose}
      title={selectedUser ? 'Assign Roles' : 'Add New User'}
      primaryBtnText="Save"
      onPrimaryClick={handleSubmit}
      primaryBtnLoading={isPending}
      secondaryBtnText="Cancel"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {!selectedUser && (
          <>
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </>
        )}

        {selectedUser && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
            <p className="text-sm text-gray-500">{selectedUser.email}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Assign Roles</h3>
          <div className="space-y-2">
            {roles?.map(role => (
              <label key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{role.name}</p>
                  <p className="text-xs text-gray-500">{role.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Slideover>
  );
}

export default function UserRoleTab() {
  const [page, setPage] = useState(1);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading } = useUsers(page, 10);

  const openSlideover = (user = null) => {
    setSelectedUser(user);
    setSlideoverOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  const users = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Users & Roles</h2>
        <Button onClick={() => openSlideover(null)}>Add New User</Button>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.userRoles?.map(ur => (
                      <span key={ur.role.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ur.role.name}
                      </span>
                    ))}
                    {(!user.userRoles || user.userRoles.length === 0) && (
                      <span className="text-xs text-gray-400 italic">No roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => openSlideover(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit Roles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} isDisabled={page === 1}>Previous</Button>
          <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} isDisabled={page >= totalPages}>Next</Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, data?.count || 0)}</span> of <span className="font-medium">{data?.count || 0}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Slideover */}
      {slideoverOpen && (
        <UserSlideover
          isOpen={slideoverOpen}
          onClose={() => setSlideoverOpen(false)}
          selectedUser={selectedUser}
        />
      )}
    </div>
  );
}
