import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLogin } from '../auth.hooks';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';
import { ROLES } from '../../../constants/rbac';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const { mutate: login, isPending, error } = useLogin();

  // Redirect if already logged in
  if (user) {
    const userRoleCodes = user.roles?.map(r => r.code) || [];
    const dest = userRoleCodes.includes(ROLES.EMPLOYEE) && !userRoleCodes.includes(ROLES.ADMIN) ? '/my-tickets' : '/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form, {
      onSuccess: (data) => {
        const userRoleCodes = data.user.roles?.map(r => r.code) || [];
        const dest = userRoleCodes.includes(ROLES.EMPLOYEE) && !userRoleCodes.includes(ROLES.ADMIN) ? '/my-tickets' : '/dashboard';
        navigate(dest, { replace: true });
      },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full px-2">
        {/* Header */}
        <div className="text-start mb-6">
          <h1 className="text-xl uppercase font-bold text-blue-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to your QuickDesk account</p>
        </div>

        <div className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error.message}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <div className='bg-blue-50 p-1 rounded-xl'>
              <Button
                type="submit"
                isLoading={isPending}
                className="w-full"
              >
                Sign in
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Register
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
          <p className="font-semibold mb-2">Demo credentials:</p>
          <div className="grid grid-cols-1 gap-1">
            <p><span className="font-medium text-gray-600 w-16 inline-block">Admin</span> admin@quickdesk.com / admin123</p>
            <p><span className="font-medium text-gray-600 w-16 inline-block">Agent</span> agent@quickdesk.com / agent123</p>
            <p><span className="font-medium text-gray-600 w-16 inline-block">User</span> employee@quickdesk.com / employee123</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
