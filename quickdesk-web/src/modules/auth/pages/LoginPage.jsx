import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../auth.hooks';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const { mutate: login, isPending, error } = useLogin();

  // Redirect if already logged in
  if (user) {
    const dest = user.legacyRole === 'employee' ? '/my-tickets' : '/dashboard';
    navigate(dest, { replace: true });
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form, {
      onSuccess: (data) => {
        const dest = data.user.legacyRole === 'employee' ? '/my-tickets' : '/dashboard';
        navigate(dest, { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">QuickDesk</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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

            <Button
              type="submit"
              isLoading={isPending}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Register
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          <p className="font-semibold mb-1">Demo credentials</p>
          <p>Admin: admin@quickdesk.com / admin123</p>
          <p>Agent: agent@quickdesk.com / agent123</p>
          <p>Employee: employee@quickdesk.com / employee123</p>
        </div>
      </div>
    </div>
  );
}
