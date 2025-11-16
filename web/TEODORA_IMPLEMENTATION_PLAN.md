# 🖥️ TEODORA - Web Dashboard Implementation Plan

**Role**: Frontend Developer - City Officials Dashboard
**Tech Stack**: React + TypeScript + Tailwind + Mapbox + Auth0
**Timeline**: 7 days (phased approach for hackathon)

---

## 🎯 OVERVIEW

Teodorina zaduženja:
- Web dashboard za gradske službenike
- Interaktivna mapa sa vizualizacijom rupa
- Filteri, tabele, i status management
- Analytics dashboard
- Route optimization UI
- AI Chatbot interface

---

## 📅 PHASE 1: Setup & Authentication (Day 1-2)

### ✅ Day 1 Morning: Project Initialization

**Tasks:**
1. Initialize React + TypeScript project
   ```bash
   cd web
   npx create-react-app . --template typescript
   # ili
   npm create vite@latest . -- --template react-ts
   ```

2. Install dependencies
   ```bash
   npm install mapbox-gl axios socket.io-client zustand
   npm install @auth0/auth0-react
   npm install -D tailwindcss postcss autoprefixer
   npm install react-router-dom
   npm install recharts  # za charts
   ```

3. Setup Tailwind CSS
   ```bash
   npx tailwindcss init -p
   ```

4. Create folder structure
   ```
   src/
   ├── pages/
   ├── components/
   ├── services/
   ├── hooks/
   ├── store/
   ├── utils/
   └── types/
   ```

**Deliverable**: ✅ Working React app sa Tailwind

---

### ✅ Day 1 Afternoon: Auth0 Integration

**Tasks:**
1. Create `src/services/authService.ts`
   ```typescript
   import { Auth0Provider } from '@auth0/auth0-react';

   export const auth0Config = {
     domain: process.env.REACT_APP_AUTH0_DOMAIN!,
     clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
     redirectUri: window.location.origin,
     audience: process.env.REACT_APP_AUTH0_AUDIENCE,
   };
   ```

2. Wrap App with Auth0Provider

3. Create `src/pages/LoginPage.tsx`
   ```typescript
   import { useAuth0 } from '@auth0/auth0-react';

   export function LoginPage() {
     const { loginWithRedirect } = useAuth0();

     return (
       <div className="min-h-screen flex items-center justify-center">
         <button onClick={() => loginWithRedirect()}>
           Login to Dashboard
         </button>
       </div>
     );
   }
   ```

4. Create protected route wrapper

**Deliverable**: ✅ Login page sa Auth0

---

### ✅ Day 2: API Service & State Management

**Tasks:**
1. Create `src/services/apiService.ts`
   ```typescript
   import axios from 'axios';

   const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

   export const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add auth token interceptor
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('auth_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

   export const potholeAPI = {
     getAll: () => api.get('/potholes'),
     getById: (id: string) => api.get(`/potholes/${id}`),
     updateStatus: (id: string, status: string) =>
       api.patch(`/potholes/${id}`, { status }),
     getStats: () => api.get('/stats'),
   };
   ```

2. Create Zustand store `src/store/useStore.ts`
   ```typescript
   import create from 'zustand';

   interface Pothole {
     _id: string;
     location: { lat: number; lng: number };
     severity: number;
     status: string;
     reports: number;
     // ...
   }

   interface AppState {
     potholes: Pothole[];
     selectedPothole: Pothole | null;
     filters: {
       severity: string;
       status: string;
       timeframe: string;
     };
     setPotholes: (potholes: Pothole[]) => void;
     selectPothole: (pothole: Pothole | null) => void;
     setFilters: (filters: any) => void;
   }

   export const useStore = create<AppState>((set) => ({
     potholes: [],
     selectedPothole: null,
     filters: { severity: 'all', status: 'all', timeframe: 'all' },
     setPotholes: (potholes) => set({ potholes }),
     selectPothole: (pothole) => set({ selectedPothole: pothole }),
     setFilters: (filters) => set({ filters }),
   }));
   ```

3. Create TypeScript types `src/types/pothole.types.ts`

**Deliverable**: ✅ API service + State management ready

---

## 📅 PHASE 2: Map & Visualization (Day 3-4)

### ✅ Day 3: Mapbox Integration

**Tasks:**
1. Install Mapbox
   ```bash
   npm install mapbox-gl @types/mapbox-gl
   ```

2. Create `src/components/Map/MapView.tsx`
   ```typescript
   import mapboxgl from 'mapbox-gl';
   import { useEffect, useRef } from 'react';

   mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;

   export function MapView() {
     const mapContainer = useRef<HTMLDivElement>(null);
     const map = useRef<mapboxgl.Map | null>(null);

     useEffect(() => {
       if (!mapContainer.current) return;

       map.current = new mapboxgl.Map({
         container: mapContainer.current,
         style: 'mapbox://styles/mapbox/streets-v12',
         center: [21.2257, 45.7489], // Timișoara
         zoom: 13,
       });

       return () => map.current?.remove();
     }, []);

     return <div ref={mapContainer} className="w-full h-full" />;
   }
   ```

3. Create `src/components/Map/PotholeMarker.tsx`
   - Custom marker component
   - Color-coded by severity (green/yellow/red)
   - Click handler to show details

4. Add markers to map
   ```typescript
   potholes.forEach(pothole => {
     const color = getSeverityColor(pothole.severity);

     new mapboxgl.Marker({ color })
       .setLngLat([pothole.location.lng, pothole.location.lat])
       .setPopup(new mapboxgl.Popup().setHTML(`
         <h3>Severity: ${pothole.severity}</h3>
         <p>Reports: ${pothole.reports}</p>
       `))
       .addTo(map.current!);
   });
   ```

**Deliverable**: ✅ Map sa pothole markerima

---

### ✅ Day 4: Heatmap & Clustering

**Tasks:**
1. Add heatmap layer
   ```typescript
   map.current.addLayer({
     id: 'potholes-heat',
     type: 'heatmap',
     source: {
       type: 'geojson',
       data: {
         type: 'FeatureCollection',
         features: potholes.map(p => ({
           type: 'Feature',
           geometry: {
             type: 'Point',
             coordinates: [p.location.lng, p.location.lat]
           },
           properties: {
             severity: p.severity
           }
         }))
       }
     },
     paint: {
       'heatmap-weight': ['get', 'severity'],
       'heatmap-intensity': 1,
       'heatmap-radius': 20,
     }
   });
   ```

2. Create heatmap toggle button

3. Add marker clustering for performance

**Deliverable**: ✅ Heatmap visualization

---

## 📅 PHASE 3: Data Display & Interaction (Day 4-5)

### ✅ Day 4 Afternoon: Pothole List & Filters

**Tasks:**
1. Create `src/components/PotholeList/PotholeTable.tsx`
   ```typescript
   interface Column {
     key: string;
     label: string;
     sortable: boolean;
   }

   const columns: Column[] = [
     { key: 'location', label: 'Location', sortable: false },
     { key: 'severity', label: 'Severity', sortable: true },
     { key: 'reports', label: 'Reports', sortable: true },
     { key: 'status', label: 'Status', sortable: false },
     { key: 'createdAt', label: 'First Reported', sortable: true },
   ];

   export function PotholeTable({ potholes }: Props) {
     const [sortKey, setSortKey] = useState('severity');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

     const sortedPotholes = useMemo(() => {
       return [...potholes].sort((a, b) => {
         // sorting logic
       });
     }, [potholes, sortKey, sortOrder]);

     return (
       <table className="w-full">
         {/* table implementation */}
       </table>
     );
   }
   ```

2. Create `src/components/Filters/FilterBar.tsx`
   ```typescript
   export function FilterBar() {
     const { filters, setFilters } = useStore();

     return (
       <div className="flex gap-4 p-4 bg-white shadow">
         <select
           value={filters.severity}
           onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
         >
           <option value="all">All Severities</option>
           <option value="low">Low</option>
           <option value="medium">Medium</option>
           <option value="high">High</option>
         </select>

         <select value={filters.status} /* ... */>
           <option value="all">All Statuses</option>
           <option value="new">New</option>
           <option value="planned">Planned</option>
           <option value="in_progress">In Progress</option>
           <option value="resolved">Resolved</option>
         </select>

         {/* Search box, date range, etc */}
       </div>
     );
   }
   ```

3. Connect filters to data fetching

**Deliverable**: ✅ Sortable table + filters

---

### ✅ Day 5 Morning: Pothole Detail Panel

**Tasks:**
1. Create `src/components/Details/PotholeDetail.tsx`
   ```typescript
   export function PotholeDetail({ pothole }: Props) {
     const [status, setStatus] = useState(pothole.status);
     const [notes, setNotes] = useState('');

     const handleStatusUpdate = async () => {
       await potholeAPI.updateStatus(pothole._id, status, notes);
       // refresh data
     };

     return (
       <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-lg p-6">
         <h2 className="text-2xl font-bold mb-4">Pothole Details</h2>

         <div className="space-y-4">
           <div>
             <label>Location</label>
             <p>{pothole.location.address || `${pothole.location.lat}, ${pothole.location.lng}`}</p>
           </div>

           <div>
             <label>Severity Score</label>
             <div className="flex items-center gap-2">
               <div className="w-full bg-gray-200 rounded-full h-4">
                 <div
                   className={`h-4 rounded-full ${getSeverityColor(pothole.severity)}`}
                   style={{ width: `${pothole.severity}%` }}
                 />
               </div>
               <span>{pothole.severity}/100</span>
             </div>
           </div>

           <div>
             <label>Reports</label>
             <p>{pothole.reports} users</p>
           </div>

           <div>
             <label>Status</label>
             <select value={status} onChange={(e) => setStatus(e.target.value)}>
               {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
             </select>
           </div>

           {pothole.photo && (
             <div>
               <label>Photo</label>
               <img src={pothole.photo} alt="Pothole" className="w-full rounded" />
             </div>
           )}

           <div>
             <label>Notes</label>
             <textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="w-full border rounded p-2"
               rows={4}
             />
           </div>

           <button
             onClick={handleStatusUpdate}
             className="w-full bg-blue-600 text-white py-2 rounded"
           >
             Update Status
           </button>
         </div>
       </div>
     );
   }
   ```

**Deliverable**: ✅ Detail panel sa status update

---

## 📅 PHASE 4: Advanced Features (Day 5-6)

### ✅ Day 5 Afternoon: Analytics Dashboard

**Tasks:**
1. Create `src/pages/AnalyticsPage.tsx`

2. Create `src/components/Analytics/StatsCards.tsx`
   ```typescript
   export function StatsCards({ stats }: Props) {
     return (
       <div className="grid grid-cols-4 gap-4 mb-8">
         <StatCard
           title="Total Potholes"
           value={stats.total}
           icon={<MapPinIcon />}
           color="blue"
         />
         <StatCard
           title="Fixed This Month"
           value={stats.fixedThisMonth}
           icon={<CheckIcon />}
           color="green"
         />
         <StatCard
           title="High Severity"
           value={stats.highSeverity}
           icon={<AlertIcon />}
           color="red"
         />
         <StatCard
           title="Avg Resolution Time"
           value={`${stats.avgResolutionTime} days`}
           icon={<ClockIcon />}
           color="yellow"
         />
       </div>
     );
   }
   ```

3. Create `src/components/Analytics/Charts.tsx` using Recharts
   ```typescript
   import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

   export function TrendChart({ data }: Props) {
     return (
       <LineChart width={600} height={300} data={data}>
         <CartesianGrid strokeDasharray="3 3" />
         <XAxis dataKey="date" />
         <YAxis />
         <Tooltip />
         <Line type="monotone" dataKey="reported" stroke="#8884d8" />
         <Line type="monotone" dataKey="fixed" stroke="#82ca9d" />
       </LineChart>
     );
   }
   ```

4. Fetch and display stats from backend

**Deliverable**: ✅ Analytics page sa charts

---

### ✅ Day 6 Morning: Route Optimization UI

**Tasks:**
1. Create `src/components/RouteOptimizer/RouteForm.tsx`
   ```typescript
   export function RouteForm() {
     const [numCrews, setNumCrews] = useState(2);
     const [routes, setRoutes] = useState<Route[]>([]);
     const [loading, setLoading] = useState(false);

     const handleOptimize = async () => {
       setLoading(true);
       const result = await api.post('/routes', { numCrews });
       setRoutes(result.data.routes);
       setLoading(false);
     };

     return (
       <div className="bg-white p-6 rounded shadow">
         <h3 className="text-xl font-bold mb-4">Route Optimization</h3>

         <div className="space-y-4">
           <div>
             <label>Number of Crews</label>
             <input
               type="number"
               value={numCrews}
               onChange={(e) => setNumCrews(parseInt(e.target.value))}
               min={1}
               max={10}
               className="w-full border rounded p-2"
             />
           </div>

           <button
             onClick={handleOptimize}
             disabled={loading}
             className="w-full bg-green-600 text-white py-2 rounded"
           >
             {loading ? 'Optimizing...' : 'Generate Routes'}
           </button>
         </div>

         {routes.length > 0 && (
           <RouteDisplay routes={routes} />
         )}
       </div>
     );
   }
   ```

2. Create `src/components/RouteOptimizer/RouteDisplay.tsx`
   - Display route list
   - Show route on map with polylines
   - Color-code each crew's route

3. Draw routes on Mapbox
   ```typescript
   routes.forEach((route, index) => {
     const color = CREW_COLORS[index];

     map.current.addLayer({
       id: `route-${index}`,
       type: 'line',
       source: {
         type: 'geojson',
         data: {
           type: 'Feature',
           geometry: {
             type: 'LineString',
             coordinates: route.coordinates
           }
         }
       },
       paint: {
         'line-color': color,
         'line-width': 4
       }
     });
   });
   ```

**Deliverable**: ✅ Route optimization feature

---

### ✅ Day 6 Afternoon: AI Chatbot Interface

**Tasks:**
1. Create `src/components/Chatbot/ChatWidget.tsx`
   ```typescript
   export function ChatWidget() {
     const [isOpen, setIsOpen] = useState(false);
     const [messages, setMessages] = useState<Message[]>([]);
     const [input, setInput] = useState('');
     const [loading, setLoading] = useState(false);

     const sendMessage = async () => {
       if (!input.trim()) return;

       const userMessage = { role: 'user', content: input };
       setMessages([...messages, userMessage]);
       setInput('');
       setLoading(true);

       try {
         const response = await api.post('/chatbot', {
           message: input,
           context: messages
         });

         const botMessage = { role: 'assistant', content: response.data.reply };
         setMessages([...messages, userMessage, botMessage]);
       } catch (error) {
         console.error('Chatbot error:', error);
       } finally {
         setLoading(false);
       }
     };

     return (
       <>
         {/* Floating button */}
         <button
           onClick={() => setIsOpen(!isOpen)}
           className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg"
         >
           <ChatIcon />
         </button>

         {/* Chat window */}
         {isOpen && (
           <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col">
             <div className="bg-blue-600 text-white p-4 rounded-t-lg">
               <h3>RoadSense Assistant</h3>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {messages.map((msg, i) => (
                 <ChatMessage key={i} message={msg} />
               ))}
               {loading && <div className="text-gray-500">Typing...</div>}
             </div>

             <div className="p-4 border-t flex gap-2">
               <input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                 placeholder="Ask me anything..."
                 className="flex-1 border rounded p-2"
               />
               <button
                 onClick={sendMessage}
                 disabled={loading}
                 className="bg-blue-600 text-white px-4 rounded"
               >
                 Send
               </button>
             </div>
           </div>
         )}
       </>
     );
   }
   ```

2. Test with sample queries

**Deliverable**: ✅ AI chatbot interface

---

## 📅 PHASE 5: Real-time & Polish (Day 7)

### ✅ Day 7: WebSocket Integration & Final Polish

**Tasks:**
1. Create `src/services/websocketService.ts`
   ```typescript
   import io from 'socket.io-client';

   const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000');

   export const websocketService = {
     connect: (token: string) => {
       socket.auth = { token };
       socket.connect();
     },

     onNewPothole: (callback: (pothole: Pothole) => void) => {
       socket.on('new_pothole', callback);
     },

     onPotholeUpdated: (callback: (pothole: Pothole) => void) => {
       socket.on('pothole_updated', callback);
     },

     disconnect: () => {
       socket.disconnect();
     }
   };
   ```

2. Integrate real-time updates
   ```typescript
   useEffect(() => {
     websocketService.connect(authToken);

     websocketService.onNewPothole((newPothole) => {
       // Add to map
       // Show notification
       setPotholes(prev => [...prev, newPothole]);
     });

     websocketService.onPotholeUpdated((updated) => {
       // Update marker
       setPotholes(prev => prev.map(p =>
         p._id === updated._id ? updated : p
       ));
     });

     return () => websocketService.disconnect();
   }, [authToken]);
   ```

3. Add toast notifications for new potholes

4. **Final Polish:**
   - Loading states
   - Error handling
   - Responsive design tweaks
   - Empty states ("No potholes found")
   - Keyboard shortcuts (optional)
   - Accessibility (aria labels)

5. **Testing:**
   - Test all features
   - Fix bugs
   - Optimize performance

**Deliverable**: ✅ Fully functional dashboard

---

## 🎯 PRIORITY CHECKLIST (for Hackathon)

### MUST HAVE (Core Features)
- [x] Auth0 login
- [x] Mapbox integration sa markerima
- [x] Pothole list sa filterima
- [x] Detail view sa status update
- [x] Basic API integration

### SHOULD HAVE (Important)
- [x] Heatmap visualization
- [x] Analytics page sa charts
- [x] Route optimizer UI
- [x] Real-time updates (WebSocket)

### NICE TO HAVE (If Time Permits)
- [ ] AI Chatbot
- [ ] Advanced filters (date range, search)
- [ ] Export functionality (CSV, PDF)
- [ ] Dark mode toggle
- [ ] Multi-language support

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Mapbox not loading
```typescript
// Make sure token is set BEFORE creating map
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN!;
```

### CORS errors
```typescript
// Backend needs to allow frontend origin
// Add this to backend: cors({ origin: 'http://localhost:3000' })
```

### Auth0 redirect loop
```typescript
// Clear localStorage and try again
localStorage.clear();
```

### Markers not showing
```typescript
// Make sure coordinates are [lng, lat] not [lat, lng]
new mapboxgl.Marker()
  .setLngLat([pothole.location.lng, pothole.location.lat]) // correct order!
```

---

## 📚 RESOURCES

- [Mapbox GL JS Docs](https://docs.mapbox.com/mapbox-gl-js/)
- [Auth0 React SDK](https://auth0.com/docs/quickstart/spa/react)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

---

## 🎉 SUCCESS CRITERIA

✅ Dashboard se učitava i auth radi
✅ Mapa prikazuje sve rupe sa correct markerima
✅ Filteri funkcionišu i table se sortira
✅ Može se update-ovati status rupe
✅ Analytics page prikazuje stats
✅ Route optimization generiše rute
✅ Real-time updates rade (nova rupa se pojavljuje automatski)

---

**Teodora, srećno! 💪 Ako zapneš, pitaj Nemanju za backend endpoint ili Vukašina za TypeScript tipove!**
