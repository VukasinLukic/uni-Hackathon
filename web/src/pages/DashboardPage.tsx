import AppLayout from '../components/Layout/AppLayout';
import { useAuth0 } from '@auth0/auth0-react';

export default function DashboardPage() {
  const { user } = useAuth0();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Pave Patrol Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hello, {user?.name || user?.email}!
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
            Authentication Successful!
          </h2>
          <p className="text-green-700 dark:text-green-300">
            Auth0 login is working perfectly. The dashboard is now protected and only accessible to authenticated users.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">Email:</span> {user?.email}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">Name:</span> {user?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">Auth Provider:</span> Auth0
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Next Steps</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>- Auth0 integration complete</li>
              <li>- Implement Mapbox integration</li>
              <li>- Build analytics dashboard</li>
              <li>- Add AI chatbot interface</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>- Total Potholes: 0</li>
              <li>- Pending Reports: 0</li>
              <li>- Fixed Today: 0</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
