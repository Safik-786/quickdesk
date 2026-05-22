import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth.api';
import { useAuth } from '../../context/AuthContext';

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.access_token, data.user);
    },
  });
}

export function useRegister() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.access_token, data.user);
    },
  });
}
