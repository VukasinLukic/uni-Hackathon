import { AccelerometerMeasurement } from 'expo-sensors';

export class SignalProcessing {
  private accelBuffer: number[] = [];
  private rawZBuffer: number[] = []; // For pothole vs curb detection
  private readonly BUFFER_SIZE = 10;
  private readonly PATTERN_WINDOW = 20; // Samples for pattern detection

  // High-pass filter to isolate spikes
  private lastFiltered = 0;
  private readonly FILTER_ALPHA = 0.8;

  calculateMagnitude(data: AccelerometerMeasurement): number {
    const { x, y, z } = data;
    return Math.sqrt(x * x + y * y + z * z);
  }

  // Extract vertical component (Z-axis acceleration)
  getVerticalAcceleration(data: AccelerometerMeasurement): number {
    // Store raw Z values for pattern analysis
    this.rawZBuffer.push(data.z);
    if (this.rawZBuffer.length > this.PATTERN_WINDOW) {
      this.rawZBuffer.shift();
    }

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

  /**
   * Detect spike pattern
   * Returns true only if it's a POTHOLE pattern (down-up), NOT a curb (up-down)
   */
  isSpikePattern(filteredValue: number, threshold: number): boolean {
    if (filteredValue <= threshold) {
      return false;
    }

    // Check if we have enough data for pattern analysis
    if (this.rawZBuffer.length < 15) {
      return false;
    }

    // Pothole pattern detection:
    // 1. First: NEGATIVE spike (drop down into pothole)
    // 2. Then: POSITIVE spike (bounce back up)
    //
    // Curb pattern (reject this):
    // 1. First: POSITIVE spike (climb up curb)
    // 2. Then: NEGATIVE spike (drop down after curb)

    const recentSamples = this.rawZBuffer.slice(-15);
    const firstHalf = recentSamples.slice(0, 7);
    const secondHalf = recentSamples.slice(7);

    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    // Find min and max in the pattern
    const minZ = Math.min(...recentSamples);
    const maxZ = Math.max(...recentSamples);
    const range = maxZ - minZ;

    // Check for significant vertical movement
    if (range < 0.5) {
      // Not enough vertical movement
      return false;
    }

    // POTHOLE: First half should be MORE NEGATIVE (drop), second half MORE POSITIVE (bounce)
    // If secondHalfAvg > firstHalfAvg, it's a pothole pattern
    const isPotholePattern = secondHalfAvg > firstHalfAvg;

    if (isPotholePattern) {
      console.log('✅ POTHOLE PATTERN DETECTED (down-up):', {
        firstHalfAvg: firstHalfAvg.toFixed(3),
        secondHalfAvg: secondHalfAvg.toFixed(3),
        range: range.toFixed(3),
      });
    } else {
      console.log('❌ CURB PATTERN REJECTED (up-down):', {
        firstHalfAvg: firstHalfAvg.toFixed(3),
        secondHalfAvg: secondHalfAvg.toFixed(3),
        range: range.toFixed(3),
      });
    }

    return isPotholePattern;
  }

  reset() {
    this.accelBuffer = [];
    this.rawZBuffer = [];
    this.lastFiltered = 0;
  }
}
