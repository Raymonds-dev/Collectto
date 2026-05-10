import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CollectionListItemProps {
  name: string;
  coverUrl?: string | null;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * CollectionListItem component for displaying a selectable collection.
 * - Shows collection cover image (or placeholder)
 * - Shows collection name
 * - Selection indicator (checkmark)
 * - Touch target size ≥48dp (Android) / ≥44pt (iOS)
 */
export const CollectionListItem: React.FC<CollectionListItemProps> = ({
  name,
  coverUrl,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Collection: ${name}`}
      accessibilityHint="Double tap to select this collection"
      className="bg-surface-primary border-surface-tertiary flex-row items-center gap-3 border-b px-4 py-3"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      {/* Cover Image */}
      <View className="bg-surface-secondary h-12 w-12 overflow-hidden rounded-lg">
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            className="h-full w-full"
            accessibilityLabel={`${name} cover image`}
          />
        ) : (
          <View className="bg-surface-tertiary h-full w-full items-center justify-center">
            <Ionicons name="images-outline" size={24} color="#999" />
          </View>
        )}
      </View>

      {/* Collection Info */}
      <View className="flex-1">
        <Text className="text-text-primary text-base font-semibold" numberOfLines={1}>
          {name}
        </Text>
      </View>

      {/* Selection Indicator */}
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          isSelected ? 'bg-brand border-brand' : 'border-surface-tertiary bg-surface-primary'
        }`}>
        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );
};

export default CollectionListItem;
