import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import Card from '../components/Card';
import { APIService } from '../services/apiService';

interface TestBackendScreenProps {
  onBack: () => void;
}

export default function TestBackendScreen({ onBack }: TestBackendScreenProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    const timestamp = new Date().toLocaleTimeString();

    try {
      console.log('🧪 Testing backend connection...');
      const isReachable = await APIService.healthCheck();

      if (isReachable) {
        setLastResult({
          success: true,
          message: 'Backend is reachable!',
          timestamp,
        });
        Alert.alert(
          '✅ Success!',
          'Backend is reachable at http://10.0.10.157:5001',
          [{ text: 'OK' }]
        );
      } else {
        setLastResult({
          success: false,
          message: 'Backend not reachable',
          timestamp,
        });
        Alert.alert(
          '❌ Connection Failed',
          'Cannot connect to backend.\n\nCheck:\n• Backend running? (npm run dev)\n• IP correct? (10.0.10.157)\n• Same WiFi network?\n• Port is 5001?',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.message || 'Connection error',
        timestamp,
      });
      Alert.alert(
        '❌ Error',
        `Failed to reach backend:\n${error.message}\n\nVerify:\n• Backend running on port 5001\n• Same WiFi network\n• Firewall not blocking`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="outline"
            onPress={onBack}
            style={styles.backButton}
          />
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
            <Text style={styles.value}>http://10.0.10.157:5001</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Endpoint:</Text>
            <Text style={styles.value}>/api/health</Text>
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

        {/* Test Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isTesting ? 'Testing...' : 'Test Connection'}
            icon={isTesting ? undefined : '🔌'}
            variant="primary"
            onPress={testConnection}
            disabled={isTesting}
            style={styles.testButton}
          />
          {isTesting && <ActivityIndicator size="small" color="#000000" style={styles.loader} />}
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>Troubleshooting</Text>
          <Text style={styles.helpText}>
            If connection fails:{'\n\n'}
            1. Ensure backend is running (npm run dev){'\n'}
            2. Check IP address is correct{'\n'}
            3. Verify both devices on same WiFi{'\n'}
            4. Check firewall settings{'\n'}
            5. Confirm port 5001 is not blocked
          </Text>
        </Card>
      </View>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
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
});
