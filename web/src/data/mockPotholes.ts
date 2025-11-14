import { Pothole } from '../types/pothole.types';

// Timișoara center coordinates: 45.7489, 21.2257
// Mock potholes around Timișoara
export const mockPotholes: Pothole[] = [
  {
    _id: '1',
    location: {
      lat: 45.7489,
      lng: 21.2257,
      address: 'Piața Victoriei, Timișoara',
    },
    severity: 8,
    status: 'reported',
    reports: 15,
    description: 'Large pothole near Victory Square',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    location: {
      lat: 45.7512,
      lng: 21.2301,
      address: 'Bulevardul Liviu Rebreanu, Timișoara',
    },
    severity: 5,
    status: 'verified',
    reports: 8,
    description: 'Medium pothole on main boulevard',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  },
  {
    _id: '3',
    location: {
      lat: 45.7456,
      lng: 21.2189,
      address: 'Strada Mercy, Timișoara',
    },
    severity: 9,
    status: 'in-progress',
    reports: 23,
    description: 'Critical pothole requiring immediate attention',
    assignedTo: 'Repair Team A',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    _id: '4',
    location: {
      lat: 45.7534,
      lng: 21.2412,
      address: 'Calea Șagului, Timișoara',
    },
    severity: 3,
    status: 'fixed',
    reports: 5,
    description: 'Small pothole - fixed',
    assignedTo: 'Repair Team B',
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    _id: '5',
    location: {
      lat: 45.7423,
      lng: 21.2134,
      address: 'Strada Ion Creangă, Timișoara',
    },
    severity: 6,
    status: 'reported',
    reports: 12,
    description: 'Pothole near residential area',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    _id: '6',
    location: {
      lat: 45.7501,
      lng: 21.2378,
      address: 'Strada Pârvan, Timișoara',
    },
    severity: 7,
    status: 'verified',
    reports: 18,
    description: 'Significant damage to road surface',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  // Additional potholes for better heatmap visualization
  {
    _id: '7',
    location: { lat: 45.7495, lng: 21.2265, address: 'Near Victory Square' },
    severity: 9,
    status: 'reported',
    reports: 20,
    description: 'Critical pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '8',
    location: { lat: 45.7485, lng: 21.2250, address: 'Central area' },
    severity: 7,
    status: 'verified',
    reports: 14,
    description: 'Major damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '9',
    location: { lat: 45.7492, lng: 21.2270, address: 'Main street' },
    severity: 8,
    status: 'reported',
    reports: 16,
    description: 'Large pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '10',
    location: { lat: 45.7480, lng: 21.2245, address: 'Downtown' },
    severity: 6,
    status: 'reported',
    reports: 10,
    description: 'Medium pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '11',
    location: { lat: 45.7515, lng: 21.2310, address: 'North area' },
    severity: 5,
    status: 'verified',
    reports: 9,
    description: 'Road damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '12',
    location: { lat: 45.7520, lng: 21.2320, address: 'Boulevard' },
    severity: 7,
    status: 'in-progress',
    reports: 15,
    description: 'Significant damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '13',
    location: { lat: 45.7460, lng: 21.2195, address: 'South district' },
    severity: 8,
    status: 'reported',
    reports: 17,
    description: 'Major pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '14',
    location: { lat: 45.7465, lng: 21.2180, address: 'Residential area' },
    severity: 6,
    status: 'verified',
    reports: 11,
    description: 'Road damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '15',
    location: { lat: 45.7470, lng: 21.2200, address: 'Side street' },
    severity: 9,
    status: 'reported',
    reports: 22,
    description: 'Critical damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '16',
    location: { lat: 45.7505, lng: 21.2385, address: 'East side' },
    severity: 7,
    status: 'in-progress',
    reports: 13,
    description: 'Large pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '17',
    location: { lat: 45.7510, lng: 21.2395, address: 'Main road' },
    severity: 8,
    status: 'verified',
    reports: 19,
    description: 'Major damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '18',
    location: { lat: 45.7430, lng: 21.2145, address: 'West area' },
    severity: 5,
    status: 'reported',
    reports: 7,
    description: 'Medium pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '19',
    location: { lat: 45.7435, lng: 21.2150, address: 'Local street' },
    severity: 6,
    status: 'verified',
    reports: 12,
    description: 'Road damage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '20',
    location: { lat: 45.7440, lng: 21.2160, address: 'Avenue' },
    severity: 9,
    status: 'reported',
    reports: 25,
    description: 'Critical pothole',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to get severity color
export function getSeverityColor(severity: number): string {
  if (severity >= 7) return '#ef4444'; // red
  if (severity >= 4) return '#f59e0b'; // orange/yellow
  return '#10b981'; // green
}

// Helper function to get severity label
export function getSeverityLabel(severity: number): string {
  if (severity >= 7) return 'High';
  if (severity >= 4) return 'Medium';
  return 'Low';
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'reported':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'verified':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'in-progress':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'fixed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}
