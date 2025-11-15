import { Auth0Client } from '@auth0/auth0-spa-js';

// Auth0 Configuration
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'your-domain.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id',
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'https://api.roadsense.com',
  },
};

// Create Auth0 client instance
let auth0Client: Auth0Client | null = null;

export const getAuth0Client = async (): Promise<Auth0Client> => {
  if (!auth0Client) {
    auth0Client = new Auth0Client(auth0Config);
  }
  return auth0Client;
};

// Auth0 service functions
export const authService = {
  // Login with redirect
  async loginWithRedirect() {
    const client = await getAuth0Client();
    await client.loginWithRedirect();
  },

  // Sign up with redirect
  async signupWithRedirect() {
    const client = await getAuth0Client();
    await client.loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  },

  // Handle redirect callback
  async handleRedirectCallback() {
    const client = await getAuth0Client();
    return await client.handleRedirectCallback();
  },

  // Get authenticated user
  async getUser() {
    const client = await getAuth0Client();
    const isAuthenticated = await client.isAuthenticated();
    if (isAuthenticated) {
      return await client.getUser();
    }
    return null;
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const client = await getAuth0Client();
    return await client.isAuthenticated();
  },

  // Get access token
  async getAccessToken() {
    const client = await getAuth0Client();
    try {
      return await client.getTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Logout
  async logout() {
    const client = await getAuth0Client();
    await client.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  },
};
