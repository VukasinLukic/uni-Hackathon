import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useMockAuth } from '../components/auth/MockAuthProvider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function LoginPage() {
  const { isAuthenticated, loginWithCredentials } = useMockAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithCredentials(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col items-start space-y-6 text-white">
            {/* Logo */}
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl">
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-6xl font-black mb-4 leading-tight">
                RoadSense
                <br />
                <span className="text-gradient">Timisoara</span>
              </h1>
              <div className="w-full h-1 bg-gradient-to-r from-red-600 to-transparent mb-6"></div>
              <div className="space-y-2">
                <p className="text-2xl font-semibold">City Officials Dashboard</p>
                <p className="text-lg text-gray-300">Secretariat for Property and Legal Affairs</p>
                <p className="text-base text-gray-400">Department for Commercial Property Procurement</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">RoadSense Timisoara</h2>
                </div>
                <p className="text-sm text-gray-300">City Officials Dashboard - Secure Login</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-white text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Username
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/90"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-200">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/90 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-200">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-primary hover:text-primary-hover">
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={loading}>
                  Log In
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-gray-400">Authorized Personnel Only</span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-gray-300 text-center">
                    Test credentials: admin@gmail.com / 123
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-gray-400 z-10">
        <p>2025 RoadSense Timisoara - City Government Portal</p>
      </div>
    </div>
  );
}
