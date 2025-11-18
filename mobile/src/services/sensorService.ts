import {
  Accelerometer,
  Gyroscope,
  AccelerometerMeasurement,
  GyroscopeMeasurement,
} from 'expo-sensors';

export class SensorService {
  private accelerometerSubscription: any;
  private gyroscopeSubscription: any;
  private isMonitoring = false;

  // Callbacks
  private onAccelerometerData?: (data: AccelerometerMeasurement) => void;
  private onGyroscopeData?: (data: GyroscopeMeasurement) => void;

  async startMonitoring(callbacks: {
    onAccelerometer: (data: AccelerometerMeasurement) => void;
    onGyroscope: (data: GyroscopeMeasurement) => void;
  }) {
    if (this.isMonitoring) return;

    this.onAccelerometerData = callbacks.onAccelerometer;
    this.onGyroscopeData = callbacks.onGyroscope;

    // Set update interval (50 Hz = 20ms)
    Accelerometer.setUpdateInterval(20);
    Gyroscope.setUpdateInterval(20);

    // Start subscriptions
    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.onAccelerometerData?.(data);
    });

    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.onGyroscopeData?.(data);
    });

    this.isMonitoring = true;
    console.log('✅ Sensors started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.accelerometerSubscription?.remove();
    this.gyroscopeSubscription?.remove();

    this.isMonitoring = false;
    console.log('🛑 Sensors stopped');
  }

  isActive() {
    return this.isMonitoring;
  }
}
