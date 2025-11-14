import * as Location from 'expo-location';

export class LocationService {
  private locationSubscription: any;
  private currentLocation: Location.LocationObject | null = null;
  private currentSpeed: number = 0; // km/h

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.error('Location permission denied');
      return false;
    }

    return true;
  }

  async startTracking(callback: (location: Location.LocationObject) => void) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // 1 second
        distanceInterval: 5, // 5 meters
      },
      (location) => {
        this.currentLocation = location;

        // Calculate speed in km/h
        if (location.coords.speed !== null && location.coords.speed >= 0) {
          this.currentSpeed = location.coords.speed * 3.6; // m/s to km/h
        }

        callback(location);
      }
    );

    console.log('✅ Location tracking started');
  }

  stopTracking() {
    this.locationSubscription?.remove();
    console.log('🛑 Location tracking stopped');
  }

  getCurrentLocation() {
    return this.currentLocation;
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }
}
