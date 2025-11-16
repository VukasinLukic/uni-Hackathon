import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoidGVhbWFwIiwiYSI6ImNtaHo5aWgwbTBsOHcyaXNjZW5ta3NodnAifQ.HESukk2q1Ju3_8oieowSKw';

// Export types and interfaces first
export interface Token {
  id: string;
  lat: number;
  lng: number;
  type?: string;
  value?: number;
  collected?: boolean;
}

export interface MapboxMessage {
  type: 'map_ready' | 'area_explored' | 'token_collected' | 'error';
  cellId?: string;
  lat?: number;
  lng?: number;
  id?: string;
  value?: number;
  message?: string;
  stack?: string;
}

export interface MapboxGamingMapRef {
  updateLocation: (latitude: number, longitude: number) => void;
}

interface MapboxGamingMapProps {
  onMapReady?: () => void;
  onAreaExplored?: (cellId: string, lat: number, lng: number) => void;
  onTokenCollected?: (tokenId: string, type: string, value: number) => void;
  onError?: (error: string) => void;
  tokens?: Token[];
  exploredCells?: string[];
  pathHistory?: Array<[number, number]>;
}

const MapboxGamingMap = React.forwardRef<MapboxGamingMapRef, MapboxGamingMapProps>(({
  onMapReady,
  onAreaExplored,
  onTokenCollected,
  onError,
  tokens = [],
  exploredCells = [],
  pathHistory = []
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load HTML file and inject Mapbox token
  useEffect(() => {
    loadHTMLContent();
  }, []);

  // Send tokens to WebView when they change
  useEffect(() => {
    if (webViewRef.current && !isLoading) {
      console.log(`🪙 Tokens changed! Sending ${tokens.length} tokens to WebView`);
      sendToWebView({
        type: 'load_tokens',
        tokens
      });
    } else if (webViewRef.current && isLoading) {
      console.log(`⏳ Map still loading, will send ${tokens.length} tokens when ready`);
    }
  }, [tokens, isLoading]);

  // Send explored cells to WebView when they change
  useEffect(() => {
    if (webViewRef.current && !isLoading && exploredCells.length > 0) {
      sendToWebView({
        type: 'load_explored_cells',
        cells: exploredCells
      });
    }
  }, [exploredCells, isLoading]);

  // Send path history to WebView when it changes
  useEffect(() => {
    if (webViewRef.current && !isLoading && pathHistory.length > 0) {
      console.log(`🛤️ Path history changed! Sending ${pathHistory.length} points to WebView`);
      sendToWebView({
        type: 'update_path',
        coordinates: pathHistory
      });
    }
  }, [pathHistory, isLoading]);

  const loadHTMLContent = async () => {
    try {
      // Load the HTML file
      const asset = Asset.fromModule(require('../../assets/mapbox-gaming-map.html'));
      await asset.downloadAsync();

      let html = '';

      if (Platform.OS === 'android') {
        // For Android, read from the downloaded asset
        html = await FileSystem.readAsStringAsync(asset.localUri || asset.uri);
      } else {
        // For iOS, fetch the content
        const response = await fetch(asset.uri);
        html = await response.text();
      }

      // Inject Mapbox token
      html = html.replace('REPLACE_WITH_TOKEN', MAPBOX_TOKEN);

      setHtmlContent(html);
    } catch (error) {
      console.error('Error loading HTML:', error);
      onError?.('Failed to load map');
    }
  };

  const sendToWebView = (message: any) => {
    console.log('🗺️ Sending to WebView:', message.type, message);
    if (webViewRef.current) {
      const script = `
        (function() {
          handleMessage(${JSON.stringify(message)});
        })();
        true;
      `;
      webViewRef.current.injectJavaScript(script);
      console.log('🗺️ JavaScript injected successfully');
    } else {
      console.warn('🗺️ WebView ref not available!');
    }
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data: MapboxMessage = JSON.parse(event.nativeEvent.data);

      console.log('Message from WebView:', data.type);

      switch (data.type) {
        case 'map_ready':
          console.log('🗺️ Map is ready! Sending initial data...');
          setIsLoading(false);
          onMapReady?.();
          // Send initial data
          if (tokens.length > 0) {
            console.log(`🪙 Sending ${tokens.length} tokens to WebView`);
            sendToWebView({ type: 'load_tokens', tokens });
          } else {
            console.log('⚠️ No tokens to send to WebView');
          }
          if (exploredCells.length > 0) {
            sendToWebView({ type: 'load_explored_cells', cells: exploredCells });
          }
          if (pathHistory.length > 0) {
            console.log(`🛤️ Sending ${pathHistory.length} path points to WebView`);
            sendToWebView({ type: 'update_path', coordinates: pathHistory });
          }
          break;

        case 'area_explored':
          if (data.cellId && data.lat && data.lng) {
            onAreaExplored?.(data.cellId, data.lat, data.lng);
          }
          break;

        case 'token_collected':
          if (data.id && data.value) {
            onTokenCollected?.(data.id, data.type || 'coin', data.value);
          }
          break;

        case 'error':
          console.error('WebView error:', data.message);
          onError?.(data.message || 'Unknown error');
          break;

        case 'debug':
          console.log('🌐 WebView Debug:', data.message);
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      onError?.('Failed to parse map message');
    }
  };

  // Public method to update user location
  const updateLocation = (latitude: number, longitude: number) => {
    console.log('🗺️ MapboxGamingMap.updateLocation called with:', latitude, longitude);
    console.log('🗺️ WebView ref exists:', !!webViewRef.current);
    sendToWebView({
      type: 'location_update',
      coords: { latitude, longitude }
    });
  };

  // Expose updateLocation method via ref
  React.useImperativeHandle(ref, () => ({
    updateLocation
  }));

  if (!htmlContent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView error:', nativeEvent);
          onError?.('WebView failed to load');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView HTTP error:', nativeEvent);
        }}
        onLoadEnd={(syntheticEvent) => {
          console.log('✅ WebView loaded successfully');
        }}
        onLoadStart={() => {
          console.log('🔄 WebView loading started...');
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        )}
        // Allow location access
        geolocationEnabled={true}
        // Optimize performance
        androidHardwareAccelerationDisabled={false}
        androidLayerType="hardware"
        // Enable console logging from WebView
        onConsoleMessage={(event) => {
          console.log('🌐 WebView Console:', event.nativeEvent.message);
        }}
      />
    </View>
  );
});

MapboxGamingMap.displayName = 'MapboxGamingMap';

export default MapboxGamingMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
