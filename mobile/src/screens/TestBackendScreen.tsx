import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { APIService } from '../services/apiService';
import { useAppStore } from '../store/useAppStore';

interface TestBackendScreenProps {
  onBack: () => void;
}

export default function TestBackendScreen({ onBack }: TestBackendScreenProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState({ current: 0, total: 0, url: '' });
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const setBackendAvailable = useAppStore((state) => state.setBackendAvailable);
  const connectivity = useAppStore((state) => state.connectivity);

  const testConnection = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();

    try {
      console.log('🧪 Testing backend connection...');
      const isReachable = await APIService.healthCheck();

      // Update global connectivity state
      setBackendAvailable(isReachable);

      if (isReachable) {
        setLastResult({
          success: true,
          message: 'Backend is reachable! App will use live data.',
          timestamp,
        });
        Alert.alert(
          '✅ Success!',
          `Backend is reachable at ${APIService.getBackendHost()}\n\nThe app will now use live backend data.`,
          [{ text: 'OK' }]
        );
      } else {
        setLastResult({
          success: false,
          message: 'Backend not reachable. App will use mock data.',
          timestamp,
        });
        Alert.alert(
          '⚠️ Offline Mode',
          'Cannot connect to backend.\n\nTry:\n1. Auto-Discovery (searches all IPs)\n2. Enter Custom IP\n3. Continue offline',
          [
            { text: 'Auto-Discovery', onPress: autoDiscover },
            { text: 'Custom IP', onPress: () => setShowCustomInput(true) },
            { text: 'Stay Offline', style: 'cancel' },
          ]
        );
      }
    } catch (error: any) {
      setBackendAvailable(false);
      setLastResult({
        success: false,
        message: error.message || 'Connection error. Using mock data.',
        timestamp,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const autoDiscover = async () => {
    setIsDiscovering(true);
    setDiscoveryProgress({ current: 0, total: 0, url: '' });

    try {
      console.log('🔍 Starting auto-discovery...');

      const discoveredUrl = await APIService.discoverBackend((url, index, total) => {
        setDiscoveryProgress({ current: index, total, url });
      });

      if (discoveredUrl) {
        setBackendAvailable(true);
        setLastResult({
          success: true,
          message: `Auto-discovered: ${discoveredUrl}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        Alert.alert(
          '✅ Backend Found!',
          `Successfully connected to:\n${discoveredUrl}\n\nThis URL will be saved for future use.`,
          [{ text: 'OK' }]
        );
      } else {
        setBackendAvailable(false);
        setLastResult({
          success: false,
          message: 'Auto-discovery failed. No backend found.',
          timestamp: new Date().toLocaleTimeString(),
        });
        Alert.alert(
          '❌ No Backend Found',
          'Tried all possible IPs and ports.\n\nOptions:\n• Enter custom IP\n• Start backend server\n• Continue in offline mode',
          [
            { text: 'Custom IP', onPress: () => setShowCustomInput(true) },
            { text: 'OK' },
          ]
        );
      }
    } catch (error: any) {
      console.error('Discovery error:', error);
      Alert.alert('Error', `Discovery failed: ${error.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const testCustomUrl = async () => {
    if (!customUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL or IP address');
      return;
    }

    setIsTesting(true);
    setShowCustomInput(false);

    try {
      const works = await APIService.testCustomUrl(customUrl);

      if (works) {
        setBackendAvailable(true);
        setLastResult({
          success: true,
          message: `Custom URL works: ${customUrl}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        Alert.alert(
          '✅ Success!',
          `Connected to custom URL:\n${customUrl}\n\nThis URL has been saved.`,
          [{ text: 'OK' }]
        );
        setCustomUrl('');
      } else {
        setBackendAvailable(false);
        setLastResult({
          success: false,
          message: `Custom URL failed: ${customUrl}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        Alert.alert(
          '❌ Connection Failed',
          `Cannot connect to:\n${customUrl}\n\nCheck:\n• Backend is running\n• URL is correct\n• Port is correct`,
          [{ text: 'Try Again', onPress: () => setShowCustomInput(true) }, { text: 'Cancel' }]
        );
      }
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Button
              title="← Back"
              variant="outline"
              onPress={onBack}
              style={styles.backButton}
            />
            <StatusBadge size="medium" />
          </View>
          <Text style={styles.title}>Test Backend</Text>
          <Text style={styles.subtitle}>Check backend connectivity</Text>
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔌</Text>
          <Text style={styles.infoTitle}>Backend Connection Test</Text>
          <Text style={styles.infoText}>
            This will test if the mobile app can reach the backend server.
          </Text>
        </Card>

        {/* Server Info */}
        <Card>
          <Text style={styles.cardTitle}>Server Configuration</Text>
          <View style={styles.row}>
            <Text style={styles.label}>URL:</Text>
            <Text style={styles.value}>{APIService.getBackendHost()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endpoint:</Text>
            <Text style={styles.value}>/health</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Mode:</Text>
            <Text style={[styles.value, connectivity.isBackendAvailable ? styles.online : styles.offline]}>
              {connectivity.isBackendAvailable ? 'Online (Live Data)' : 'Offline (Mock Data)'}
            </Text>
          </View>
        </Card>

        {/* Last Test Result */}
        {lastResult && (
          <Card style={lastResult.success ? styles.successCard : styles.errorCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{lastResult.success ? '✅' : '❌'}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>
                  {lastResult.success ? 'Connection Successful' : 'Connection Failed'}
                </Text>
                <Text style={styles.resultTime}>{lastResult.timestamp}</Text>
              </View>
            </View>
            <Text style={styles.resultMessage}>{lastResult.message}</Text>
          </Card>
        )}

        {/* Auto-Discovery Progress */}
        {isDiscovering && (
          <Card style={styles.discoveryCard}>
            <Text style={styles.discoveryTitle}>🔍 Auto-Discovering Backend...</Text>
            <Text style={styles.discoveryText}>
              Testing {discoveryProgress.current} of {discoveryProgress.total}
            </Text>
            <Text style={styles.discoveryUrl} numberOfLines={1}>
              {discoveryProgress.url}
            </Text>
            <ActivityIndicator size="large" color="#007AFF" style={styles.discoveryLoader} />
          </Card>
        )}

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={isTesting ? 'Testing...' : 'Test Connection'}
            icon={isTesting ? undefined : '🔌'}
            variant="primary"
            onPress={testConnection}
            disabled={isTesting || isDiscovering}
            style={styles.testButton}
          />

          <View style={styles.buttonRow}>
            <Button
              title="Auto-Discover"
              icon="🔍"
              variant="secondary"
              onPress={autoDiscover}
              disabled={isTesting || isDiscovering}
              style={styles.halfButton}
            />
            <Button
              title="Custom IP"
              icon="⚙️"
              variant="outline"
              onPress={() => setShowCustomInput(true)}
              disabled={isTesting || isDiscovering}
              style={styles.halfButton}
            />
          </View>
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>About Offline Mode</Text>
          <Text style={styles.helpText}>
            The app works in TWO MODES:{'\n\n'}
            <Text style={styles.bold}>Online Mode (Backend Connected):</Text>{'\n'}
            • Real-time pothole data{'\n'}
            • Events saved to database{'\n'}
            • Live clustering & analysis{'\n\n'}
            <Text style={styles.bold}>Offline Mode (No Backend):</Text>{'\n'}
            • Uses mock/cached data{'\n'}
            • Events stored locally{'\n'}
            • Full app functionality{'\n\n'}
            If connection fails:{'\n'}
            1. Backend running? (npm run dev){'\n'}
            2. IP correct? ({APIService.getBackendHost()}){'\n'}
            3. Same WiFi network?{'\n'}
            4. Firewall blocking port 5001?
          </Text>
        </Card>
      </ScrollView>

      {/* Custom URL Input Modal */}
      <Modal visible={showCustomInput} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Backend URL</Text>
            <Text style={styles.modalSubtitle}>
              Enter your computer's IP address and port
            </Text>

            <TextInput
              style={styles.input}
              placeholder="192.168.1.100:5001"
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <Text style={styles.modalHint}>
              Examples:{'\n'}
              • 192.168.1.100:5001{'\n'}
              • 10.0.10.157:5001{'\n'}
              • http://192.168.1.100:5001
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setShowCustomInput(false);
                  setCustomUrl('');
                }}
                style={styles.modalButton}
              />
              <Button
                title="Test URL"
                variant="primary"
                onPress={testCustomUrl}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#8e8e93',
    letterSpacing: -0.4,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 32,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  infoText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f7',
  },
  label: {
    fontSize: 15,
    color: '#8e8e93',
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'monospace',
  },
  successCard: {
    backgroundColor: '#e8f5e9',
    marginTop: 24,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    marginTop: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  resultIcon: {
    fontSize: 32,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resultTime: {
    fontSize: 13,
    color: '#8e8e93',
  },
  resultMessage: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  testButton: {
    paddingVertical: 20,
  },
  loader: {
    marginTop: 12,
  },
  helpCard: {
    backgroundColor: '#fff9e6',
  },
  helpTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  online: {
    color: '#4caf50',
    fontWeight: '600',
  },
  offline: {
    color: '#ff9800',
    fontWeight: '600',
  },
  discoveryCard: {
    backgroundColor: '#e3f2fd',
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 24,
  },
  discoveryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  discoveryText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  discoveryUrl: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  discoveryLoader: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  halfButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  modalHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
