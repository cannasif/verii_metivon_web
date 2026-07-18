import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { isTokenValid } from '@/utils/jwt';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
}

export function ProtectedRoute({ children }: { children: ReactElement }): ReactElement {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const storedToken = getStoredToken();
  const isAuthenticated = Boolean(user && ((token && isTokenValid(token)) || (storedToken && isTokenValid(storedToken))));
  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
}
