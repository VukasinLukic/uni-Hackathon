import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { IPothole } from '../models/Pothole.model';

let io: Server;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL!, process.env.MOBILE_URL!],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id);

    socket.on('subscribe_location', (data: { lat: number; lng: number }) => {
      const room = 'location_' + Math.floor(data.lat) + '_' + Math.floor(data.lng);
      socket.join(room);
      console.log('Socket ' + socket.id + ' joined room ' + room);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected: ' + socket.id);
    });
  });

  console.log('Socket.IO initialized');
};

export const emitPotholeUpdate = (
  event: 'new_pothole' | 'pothole_updated',
  pothole: IPothole
) => {
  if (!io) return;

  io.emit(event, {
    potholeId: pothole._id,
    location: pothole.location,
    severity: pothole.severity,
    status: pothole.status,
  });

  const [lng, lat] = pothole.location.coordinates;
  const room = 'location_' + Math.floor(lat) + '_' + Math.floor(lng);
  io.to(room).emit('nearby_pothole', pothole);
};
