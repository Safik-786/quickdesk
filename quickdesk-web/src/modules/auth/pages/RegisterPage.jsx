import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../auth.hooks';
import Input from '../../core/components/ui/Input';
import Button from '../../core/components/ui/Button';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const { mutate: register, isPending, error } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    register(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully. Please sign in.');
          navigate('/login', { replace: true });
        },
      }
    );
  };

  return (
    <AuthLayout>
      <div className="w-full h-full overflow-auto px-1">
        <div className="text-start mb-6">
          <h1 className="text-xl uppercase font-bold text-gray-900 tracking-tight">Create account</h1>
          <p className="text-xs text-gray-500 mt-2">Join QuickDesk today and level up your team.</p>
        </div>

        <div className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error.message}
              </div>
            )}

            <Input
              label="Full name"
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
            />

            <Input
              label="Email address"
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />

            <Input
              label="Password"
              type="password" required minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Min. 6 characters"
            />

            <Input
              label="Confirm Password"
              type="password" required minLength={6}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Confirm password"
            />

            <Button
              type="submit" isLoading={isPending}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
