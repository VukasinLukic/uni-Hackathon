import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function LoginPage() {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    loginWithRedirect({
      appState: {
        returnTo: '/dashboard',
      },
    });
  };

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
      appState: {
        returnTo: '/dashboard',
      },
    });
  };

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#2B3A67' }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'url(/assets/Desktop.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-end px-4 py-8 pr-48">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-3">Pave Patrol Timisoara</h2>
              <p className="text-sm text-white">City Officials Dashboard - Secure Login</p>
            </div>

            {/* Auth0 Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirecting...' : 'Log In with Auth0'}
              </button>

              <button
                onClick={handleSignup}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirecting...' : 'Sign Up'}
              </button>

              <p className="text-xs text-white/70 text-center mt-4">
                Secure authentication powered by Auth0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 p-6 text-sm text-gray-400 z-10" style={{ marginLeft: '30px' }}>
        <p>2025 Pave Patrol Timisoara - City Government Portal</p>
      </div>
    </div>
  );
}
