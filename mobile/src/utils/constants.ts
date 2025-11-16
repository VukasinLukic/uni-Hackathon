// Detection thresholds
export const POTHOLE_THRESHOLD = 1.5; // 1.5g spike
export const COOLDOWN_MS = 2000; // 2 seconds between detections

// Speed validation (km/h)
export const MIN_SPEED = 15;
export const MAX_SPEED = 90;

// Sensor sampling
export const ACCELEROMETER_UPDATE_INTERVAL = 20; // 50 Hz
export const GYROSCOPE_UPDATE_INTERVAL = 20;

// Location
export const LOCATION_UPDATE_INTERVAL = 1000; // 1 second
export const LOCATION_DISTANCE_INTERVAL = 5; // 5 meters

// Alert distances (meters)
export const ALERT_DISTANCE_SLOW = 30;
export const ALERT_DISTANCE_MEDIUM = 75;
export const ALERT_DISTANCE_FAST = 150;

// Signal processing
export const BUFFER_SIZE = 10;
export const FILTER_ALPHA = 0.8;

// Orientation stability
export const ORIENTATION_BUFFER_SIZE = 30;
export const STABILITY_VARIANCE_THRESHOLD = 0.5;
