import { useState } from 'react';
import UserRoleTab from '../components/UserRoleTab';
import RolePermissionTab from '../components/RolePermissionTab';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/rbac';
import PageHeader from '../../../components/ui/PageHeader';

export default function RBACManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const userRoleCodes = user?.roles?.map(r => r.code) || [];
  const isAdmin = userRoleCodes.includes(ROLES.ADMIN);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access RBAC Management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <PageHeader 
          title="RBAC Management" 
          description="Manage users, roles, and permissions" 
          className="mb-0"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                User Roles
              </span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Roles & Permissions
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && <UserRoleTab />}
          {activeTab === 'roles' && <RolePermissionTab />}
        </div>
      </div>
    </div>
  );
}
