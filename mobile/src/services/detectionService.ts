import { AccelerometerMeasurement, GyroscopeMeasurement } from 'expo-sensors';
import { SignalProcessing } from '../utils/signalProcessing';
import { ContextChecks } from '../utils/contextChecks';

interface PotholeEvent {
  timestamp: Date;
  location: { lat: number; lng: number };
  magnitude: number;
  speed: number;
}

export class DetectionService {
  private signalProcessor = new SignalProcessing();
  private contextChecker = new ContextChecks();

  private readonly POTHOLE_THRESHOLD = 1.5; // 1.5g spike (real driving)
  private readonly TEST_MODE_THRESHOLD = 1.2; // Test mode - need a STRONG shake!
  private readonly COOLDOWN_MS = 5000; // 5 seconds between detections (prevent spam)
  private lastDetectionTime = 0;

  private testMode = false; // Test mode flag

  private onPotholeDetected?: (event: PotholeEvent) => void;

  setCallback(callback: (event: PotholeEvent) => void) {
    this.onPotholeDetected = callback;
  }

  enableTestMode(enabled: boolean) {
    this.testMode = enabled;
    console.log(`🧪 Test Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  processAccelerometerData(
    accelData: AccelerometerMeasurement,
    gyroData: GyroscopeMeasurement,
    location: { lat: number; lng: number },
    speed: number
  ) {
    // In test mode, skip strict checks
    if (!this.testMode) {
      // Context checks (only in real mode)
      if (!this.contextChecker.isValidSpeed(speed)) {
        return; // Not driving speed
      }

      if (!this.contextChecker.isDeviceStable(gyroData)) {
        return; // Device not stable
      }
    }

    // Cooldown check (always apply)
    const now = Date.now();
    if (now - this.lastDetectionTime < this.COOLDOWN_MS) {
      return;
    }

    // Signal processing
    const magnitude = this.signalProcessor.calculateMagnitude(accelData);
    const vertical = this.signalProcessor.getVerticalAcceleration(accelData);
    const filtered = this.signalProcessor.applyHighPassFilter(vertical);

    // Choose threshold based on mode
    const threshold = this.testMode ? this.TEST_MODE_THRESHOLD : this.POTHOLE_THRESHOLD;

    // In test mode, use simple magnitude check (no pattern analysis)
    // BOTH conditions must be met OR magnitude must be very high
    const isDetected = this.testMode
      ? (filtered > threshold && magnitude > 1.3) || magnitude > 2.0 // Test: STRONG shake needed!
      : this.signalProcessor.isSpikePattern(filtered, threshold); // Real: Full pattern check

    // Detection
    if (isDetected) {
      console.log('🕳️ POTHOLE DETECTED!', {
        mode: this.testMode ? 'TEST' : 'REAL',
        magnitude: magnitude.toFixed(3),
        filtered: filtered.toFixed(3),
        threshold: threshold.toFixed(3),
        speed: speed.toFixed(1),
      });

      this.lastDetectionTime = now;

      const event: PotholeEvent = {
        timestamp: new Date(),
        location,
        magnitude: filtered,
        speed,
      };

      this.onPotholeDetected?.(event);
    }
  }

  reset() {
    this.signalProcessor.reset();
    this.contextChecker.reset();
    this.lastDetectionTime = 0;
  }
}
