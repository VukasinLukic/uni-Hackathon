import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-8 min-h-screen">
        {/* Hero Section */}
        <View className="mb-12">
          <Text className="text-6xl font-black text-white text-center mb-4">
            RoadSense
          </Text>
          <Text className="text-2xl text-primary text-center font-bold">
            Timișoara
          </Text>
          <Text className="text-gray-400 text-center mt-4 text-lg">
            Smart pothole detection
          </Text>
        </View>

        {/* Demo Card */}
        <View className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-md mb-8">
          <Text className="text-2xl font-bold text-white mb-2">
            🎨 NativeWind is Working!
          </Text>
          <Text className="text-gray-300 mb-6">
            Tailwind CSS utilities working in React Native via NativeWind
          </Text>

          {/* Counter */}
          <View className="flex-row items-center justify-center gap-4 mb-6">
            <TouchableOpacity
              onPress={() => setCount(count - 1)}
              className="bg-transparent border-2 border-white/30 px-6 py-3 rounded-xl"
            >
              <Text className="text-white text-2xl font-bold">-</Text>
            </TouchableOpacity>

            <Text className="text-4xl font-bold text-primary min-w-[80px] text-center">
              {count}
            </Text>

            <TouchableOpacity
              onPress={() => setCount(count + 1)}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View className="gap-3">
            <View className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Text className="text-xl mb-1">📱</Text>
              <Text className="font-semibold text-white">Sensor Detection</Text>
              <Text className="text-sm text-gray-400">Accelerometer + GPS</Text>
            </View>

            <View className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Text className="text-xl mb-1">🗺️</Text>
              <Text className="font-semibold text-white">Live Map</Text>
              <Text className="text-sm text-gray-400">Real-time alerts</Text>
            </View>

            <View className="bg-white/5 p-4 rounded-xl border border-white/10">
              <Text className="text-xl mb-1">📸</Text>
              <Text className="font-semibold text-white">Photo Capture</Text>
              <Text className="text-sm text-gray-400">AI validation</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-4">
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">Start Drive</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-transparent border-2 border-white/30 px-6 py-3 rounded-xl">
            <Text className="text-white font-semibold">View Map</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text className="text-gray-500 text-sm mt-12 text-center">
          uni-Hackathon Project{'\n'}
          Vukasin • Nemanja • Teodora
        </Text>
      </View>
    </ScrollView>
  );
}
