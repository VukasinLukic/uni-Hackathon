import { AccelerometerMeasurement } from 'expo-sensors';

export class SignalProcessing {
  private accelBuffer: number[] = [];
  private readonly BUFFER_SIZE = 10;

  // High-pass filter to isolate spikes
  private lastFiltered = 0;
  private readonly FILTER_ALPHA = 0.8;

  calculateMagnitude(data: AccelerometerMeasurement): number {
    const { x, y, z } = data;
    return Math.sqrt(x * x + y * y + z * z);
  }

  // Extract vertical component (assuming phone is relatively stable)
  getVerticalAcceleration(data: AccelerometerMeasurement): number {
    // Simplified: use z-axis as vertical
    // In production, would use gyro data to transform to earth frame
    return Math.abs(data.z);
  }

  // High-pass filter to remove smooth changes
  applyHighPassFilter(value: number): number {
    const filtered =
      this.FILTER_ALPHA *
      (this.lastFiltered + value - (this.accelBuffer[0] || value));
    this.lastFiltered = filtered;

    // Add to buffer
    this.accelBuffer.push(value);
    if (this.accelBuffer.length > this.BUFFER_SIZE) {
      this.accelBuffer.shift();
    }

    return Math.abs(filtered);
  }

  // Detect spike pattern
  isSpikePattern(filteredValue: number, threshold: number): boolean {
    return filteredValue > threshold;
  }

  reset() {
    this.accelBuffer = [];
    this.lastFiltered = 0;
  }
}
