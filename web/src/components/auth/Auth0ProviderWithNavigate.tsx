import { Auth0Provider, AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export default function Auth0ProviderWithNavigate({
  children,
}: Auth0ProviderWithNavigateProps) {
  const navigate = useNavigate();

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = `${window.location.origin}/dashboard`;

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || '/dashboard');
  };

  if (!domain || !clientId) {
    console.error('Auth0 domain and clientId must be provided');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">
            Configuration Error
          </h2>
          <p className="text-gray-400 mb-4">
            Auth0 configuration is missing. Please check your environment
            variables:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>VITE_AUTH0_DOMAIN</li>
            <li>VITE_AUTH0_CLIENT_ID</li>
            <li>VITE_AUTH0_AUDIENCE (optional)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
