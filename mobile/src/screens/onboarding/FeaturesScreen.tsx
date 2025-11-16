import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');

type FeaturesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Features'>;

interface Feature {
  id: string;
  image: any;
}

interface FeaturesScreenProps {
  onNext?: () => void;
}

const FEATURES: Feature[] = [
  {
    id: '1',
    image: require('../../../assets/images/Intro 6.png'),
  },
  {
    id: '2',
    image: require('../../../assets/images/Intro 7.png'),
  },
  {
    id: '3',
    image: require('../../../assets/images/Intro 8.png'),
  },
  {
    id: '4',
    image: require('../../../assets/images/Intro 9.png'),
  },
];

export default function FeaturesScreen({ onNext }: FeaturesScreenProps) {
  const navigation = useNavigation<FeaturesScreenNavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < FEATURES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      if (onNext) {
        onNext();
      } else {
        navigation.navigate('Auth');
      }
    }
  };

  const renderFeatureCard = ({ item }: { item: Feature }) => {
    return (
      <View style={[styles.cardContainer, { width }]}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {FEATURES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 30, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Features Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={FEATURES}
            renderItem={renderFeatureCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
          />
        </View>

        {/* Pagination Dots */}
        {renderPagination()}

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === FEATURES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  carouselContainer: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  paginationDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#071E35',
    textAlign: 'center',
  },
});
