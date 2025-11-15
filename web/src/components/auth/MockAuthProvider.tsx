import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAuthService } from '../../services/mockAuthService';

interface MockAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

interface MockAuthProviderProps {
  children: ReactNode;
}

export function MockAuthProvider({ children }: MockAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    console.log('[MockAuth] Checking authentication status...');
    const currentUser = mockAuthService.getCurrentUser();
    console.log('[MockAuth] Current user:', currentUser);
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
    console.log('[MockAuth] Auth check complete. Is authenticated:', !!currentUser);
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const user = await mockAuthService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <MockAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
}
