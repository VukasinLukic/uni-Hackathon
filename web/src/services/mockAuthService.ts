// Mock authentication service - temporary until backend is ready
// Credentials: admin@gmail.com / 123

interface MockUser {
  email: string;
  password: string;
  displayName: string;
  role: string;
}

const MOCK_USERS: MockUser[] = [
  {
    email: 'admin@gmail.com',
    password: '123',
    displayName: 'Admin User',
    role: 'admin',
  },
];

const STORAGE_KEY = 'mock_auth_user';

export const mockAuthService = {
  /**
   * Mock login - checks credentials against mock users
   */
  login(email: string, password: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          // Store user in localStorage
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500); // Simulate network delay
    });
  },

  /**
   * Mock logout - removes user from storage
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Get current logged in user
   */
  getCurrentUser(): MockUser | null {
    const userStr = localStorage.getItem(STORAGE_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};
