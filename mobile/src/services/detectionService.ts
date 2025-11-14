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

  private readonly POTHOLE_THRESHOLD = 1.5; // 1.5g spike
  private readonly COOLDOWN_MS = 2000; // 2 seconds between detections
  private lastDetectionTime = 0;

  private onPotholeDetected?: (event: PotholeEvent) => void;

  setCallback(callback: (event: PotholeEvent) => void) {
    this.onPotholeDetected = callback;
  }

  processAccelerometerData(
    accelData: AccelerometerMeasurement,
    gyroData: GyroscopeMeasurement,
    location: { lat: number; lng: number },
    speed: number
  ) {
    // Context checks
    if (!this.contextChecker.isValidSpeed(speed)) {
      return; // Not driving speed
    }

    if (!this.contextChecker.isDeviceStable(gyroData)) {
      return; // Device not stable
    }

    // Cooldown check
    const now = Date.now();
    if (now - this.lastDetectionTime < this.COOLDOWN_MS) {
      return;
    }

    // Signal processing
    const magnitude = this.signalProcessor.calculateMagnitude(accelData);
    const vertical = this.signalProcessor.getVerticalAcceleration(accelData);
    const filtered = this.signalProcessor.applyHighPassFilter(vertical);

    // Detection
    if (this.signalProcessor.isSpikePattern(filtered, this.POTHOLE_THRESHOLD)) {
      console.log('🕳️ POTHOLE DETECTED!', { magnitude, filtered, speed });

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
