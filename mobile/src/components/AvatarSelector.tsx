import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { FONTS } from '../utils/typography';

// 5 predefined avatar options
const AVATAR_OPTIONS = [
  { id: 1, emoji: '👨', label: 'Person 1' },
  { id: 2, emoji: '👩', label: 'Person 2' },
  { id: 3, emoji: '🧑', label: 'Person 3' },
  { id: 4, emoji: '👤', label: 'Silhouette' },
  { id: 5, emoji: '🚗', label: 'Driver' },
];

interface AvatarSelectorProps {
  selectedAvatar: number;
  onSelectAvatar: (avatarNumber: number) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelectAvatar,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Avatar</Text>
      <View style={styles.avatarGrid}>
        {AVATAR_OPTIONS.map((avatar) => (
          <TouchableOpacity
            key={avatar.id}
            style={[
              styles.avatarOption,
              selectedAvatar === avatar.id && styles.avatarSelected,
            ]}
            onPress={() => onSelectAvatar(avatar.id)}
          >
            <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
            {selectedAvatar === avatar.id && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.heading,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  selectedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONTS.button,
  },
});

// Helper function to get avatar emoji by number
export const getAvatarEmoji = (avatarNumber: number = 1): string => {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarNumber);
  return avatar?.emoji || AVATAR_OPTIONS[0].emoji;
};
