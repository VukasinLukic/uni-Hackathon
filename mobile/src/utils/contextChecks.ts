import { GyroscopeMeasurement } from 'expo-sensors';

export class ContextChecks {
  private orientationBuffer: GyroscopeMeasurement[] = [];
  private readonly BUFFER_SIZE = 30; // 30 samples @ 50Hz = 0.6 seconds

  // Check if speed is in valid range for driving
  isValidSpeed(speed: number): boolean {
    return speed >= 15 && speed <= 90; // km/h
  }

  // Check if device is stable (not being waved around)
  isDeviceStable(gyroData: GyroscopeMeasurement): boolean {
    this.orientationBuffer.push(gyroData);

    if (this.orientationBuffer.length > this.BUFFER_SIZE) {
      this.orientationBuffer.shift();
    }

    if (this.orientationBuffer.length < this.BUFFER_SIZE) {
      return false; // Not enough data yet
    }

    // Calculate variance
    const variance = this.calculateVariance(
      this.orientationBuffer.map((d) =>
        Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
      )
    );

    // Low variance = stable device
    return variance < 0.5;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  reset() {
    this.orientationBuffer = [];
  }
}
