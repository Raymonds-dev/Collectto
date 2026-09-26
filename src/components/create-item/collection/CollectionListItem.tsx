import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Props for the CollectionListItem component.
 */
interface CollectionListItemProps {
  /** The name of the collection. */
  name: string;
  /** Optional URL for the collection's cover image. */
  coverUrl?: string | null;
  /** Whether this collection is currently selected. */
  isSelected: boolean;
  /** Callback function when the item is pressed. */
  onPress: () => void;
}

/**
 * A selectable list item representing a collection.
 *
 * Features:
 * - Displays collection cover image (or a placeholder if unavailable).
 * - Displays the collection name.
 * - Shows a visual selection indicator (checkmark).
 * - Optimized touch target size (minimum 44-48 units).
 * - Accessible as a radio button in a list.
 *
 * @param props - The component props.
 * @returns A React component for a collection list entry.
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
