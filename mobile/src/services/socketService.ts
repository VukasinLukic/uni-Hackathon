import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.10.156:7392'; // Regular WiFi IP

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  connect(userId: string) {
    if (this.socket?.connected && this.userId === userId) {
      return this.socket;
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      query: { userId }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.socket?.emit('join-user-room', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  // Real-time fog reveal
  emitCellExplored(cellId: string, lat: number, lng: number) {
    this.emit('cell-explored', { cellId, lat, lng, userId: this.userId });
  }

  onCellExploredByOthers(callback: (data: { userId: string; cellId: string; lat: number; lng: number }) => void) {
    this.on('user-explored-cell', callback);
  }

  // Leaderboard updates
  onLeaderboardUpdate(callback: (data: any) => void) {
    this.on('leaderboard-update', callback);
  }

  // Level up notifications
  onLevelUp(callback: (data: { userId: string; newLevel: number; totalXP: number }) => void) {
    this.on('level-up', callback);
  }

  // Achievement unlocked
  onAchievementUnlocked(callback: (data: any) => void) {
    this.on('achievement-unlocked', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
