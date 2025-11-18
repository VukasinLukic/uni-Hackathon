export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'official' | 'viewer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}