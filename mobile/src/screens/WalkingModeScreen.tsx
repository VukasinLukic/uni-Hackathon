import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Image, Alert, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import Button from '../components/Button';
import { LocationService } from '../services/locationService';
import { APIService } from '../services/apiService';

interface WalkingModeScreenProps {
  onBack: () => void;
}

export default function WalkingModeScreen({ onBack }: WalkingModeScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('Loading address...');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLat, setEditLat] = useState('');
  const [editLng, setEditLng] = useState('');

  const cameraRef = useRef<CameraView>(null);
  const locationServiceRef = useRef(new LocationService());

  useEffect(() => {
    (async () => {
      // Request camera permission if not granted
      if (!permission?.granted) {
        await requestPermission();
      }

      // Get current location
      const locationService = locationServiceRef.current;
      const hasLocationPermission = await locationService.requestPermissions();

      if (hasLocationPermission) {
        const currentLocation = await locationService.getCurrentLocationOnce();
        if (currentLocation) {
          const lat = currentLocation.coords.latitude;
          const lng = currentLocation.coords.longitude;

          setLocation({ lat, lng });
          setEditLat(lat.toFixed(6));
          setEditLng(lng.toFixed(6));

          // Reverse geocode to get address
          try {
            const [addressResult] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
            if (addressResult) {
              const addressString = `${addressResult.street || ''} ${addressResult.streetNumber || ''}, ${addressResult.city || ''}, ${addressResult.region || ''}`.trim();
              setAddress(addressString || 'Address not found');
            }
          } catch (error) {
            console.error('Failed to reverse geocode:', error);
            setAddress('Address not available');
          }
        }
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      setPhoto(photo.uri);
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const retakePicture = () => {
    setPhoto(null);
  };

  const submitReport = async () => {
    if (!photo || !location) {
      Alert.alert('Error', 'Missing photo or location');
      return;
    }

    setIsSubmitting(true);

    try {
      // Send pothole report to backend
      const response = await APIService.sendPotholeEvent({
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
        accelerationData: {
          magnitude: 0, // Walking mode doesn't use sensors
          x: 0,
          y: 0,
          z: 0,
        },
        gyroscopeData: {
          alpha: 0,
          beta: 0,
          gamma: 0,
        },
        deviceOrientation: {
          pitch: 0,
          roll: 0,
          yaw: 0,
        },
        speed: 0, // Walking mode
        timestamp: new Date(),
        // TODO: Add photo upload
        // photo: photo.base64,
      });

      Alert.alert(
        '✅ Success!',
        'Pothole report submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setPhoto(null);
              onBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      Alert.alert(
        'Error',
        'Failed to submit report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>Requesting permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorText}>
            Please enable camera access in your device settings to use Walking Mode.
          </Text>
          <Button title="Go Back" onPress={onBack} variant="primary" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Photo preview mode
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={styles.previewContainer}>
          <Image source={{ uri: photo }} style={styles.preview} />

          <View style={styles.previewOverlay}>
            {/* Header */}
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={retakePicture} style={styles.previewHeaderButton}>
                <Text style={styles.previewHeaderText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.previewTitle}>Review Photo</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Location Info */}
            {location && (
              <View style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <TouchableOpacity onPress={() => setIsEditingLocation(!isEditingLocation)}>
                    <Text style={styles.editIcon}>✏️</Text>
                  </TouchableOpacity>
                </View>

                {isEditingLocation ? (
                  <View style={styles.editContainer}>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Lat:</Text>
                      <TextInput
                        style={styles.editInput}
                        value={editLat}
                        onChangeText={setEditLat}
                        keyboardType="numeric"
                        placeholder="Latitude"
                      />
                    </View>
                    <View style={styles.editRow}>
                      <Text style={styles.editLabel}>Lng:</Text>
                      <TextInput
                        style={styles.editInput}
                        value={editLng}
                        onChangeText={setEditLng}
                        keyboardType="numeric"
                        placeholder="Longitude"
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => {
                        const newLat = parseFloat(editLat);
                        const newLng = parseFloat(editLng);
                        if (!isNaN(newLat) && !isNaN(newLng)) {
                          setLocation({ lat: newLat, lng: newLng });
                          setIsEditingLocation(false);
                        }
                      }}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.addressText}>{address}</Text>
                    <Text style={styles.coordsText}>
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </Text>
                  </>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.previewActions}>
              <Button
                title="Retake"
                icon="🔄"
                variant="secondary"
                onPress={retakePicture}
                style={{ flex: 1 }}
              />
              <Button
                title={isSubmitting ? "Sending..." : "Send Report"}
                icon="📤"
                variant="primary"
                onPress={submitReport}
                disabled={isSubmitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera mode
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      {/* Overlay with absolute positioning */}
      <View style={styles.cameraOverlay}>
        {/* Header */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Walking Mode</Text>
            <View style={{ width: 80 }} />
          </View>
        </SafeAreaView>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsIcon}>📸</Text>
          <Text style={styles.instructionsTitle}>Take a Photo</Text>
          <Text style={styles.instructionsText}>
            Point your camera at the pothole and tap the button below
          </Text>
        </View>

        {/* Capture Button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  messageText: {
    fontSize: 17,
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 0,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cameraTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  instructionsCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: 24,
    marginTop: 40,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  instructionsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 15,
    color: '#c7c7cc',
    textAlign: 'center',
    lineHeight: 20,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  previewHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '300',
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  locationCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 24,
  },
  editIcon: {
    fontSize: 20,
  },
  addressText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
  },
  coordsText: {
    fontSize: 12,
    color: '#c7c7cc',
    fontFamily: 'monospace',
  },
  editContainer: {
    gap: 12,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editLabel: {
    fontSize: 14,
    color: '#ffffff',
    width: 40,
  },
  editInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
});
