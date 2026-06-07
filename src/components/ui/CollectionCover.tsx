import React from 'react';
import { Image, View } from 'react-native';
import { tokens } from '@/styles/tailwind/tokens.native';

export interface CollectionCoverProps {
  /** Array of image URIs to display on the stack layers */
  images?: string[];
  /** Optional fixed size for the cover. If not provided, it fills the parent aspect-square. */
  size?: number;
  /** Additional Tailwind classes */
  className?: string;
}

const FALLBACK_COLORS = [
  tokens.colors.brand[100],
  tokens.colors.brand[50],
  tokens.colors.surface.muted,
];

/**
 * A standard UI component for displaying collection covers as a stack of cards.
 * It automatically handles up to 3 images and displays them with a dynamic stacked rotation effect.
 */
export const CollectionCover = ({ images = [], size, className = '' }: CollectionCoverProps) => {
  const layerImages = [images[0], images[1] || images[0], images[2] || images[1] || images[0]];

  return (
    <View
      className={`relative items-center justify-center ${!size ? 'aspect-square w-full' : ''} ${className}`}
      style={size ? { width: size, height: size } : undefined}>
      {/* Layer 3 (Bottom) */}
      <View
        className="absolute h-[75%] w-[65%] overflow-hidden rounded-2xl"
        style={{
          backgroundColor: FALLBACK_COLORS[2],
          zIndex: 1,
          transform: [{ translateX: 6 }, { rotate: '6deg' }],
        }}>
        {layerImages[2] ? (
          <Image
            source={{ uri: layerImages[2] }}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Layer 2 (Middle) */}
      <View
        className="absolute h-[75%] w-[65%] overflow-hidden rounded-2xl shadow-sm"
        style={{
          backgroundColor: FALLBACK_COLORS[1],
          zIndex: 2,
          transform: [{ translateX: 0 }, { rotate: '-2deg' }],
        }}>
        {layerImages[1] ? (
          <Image
            source={{ uri: layerImages[1] }}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Layer 1 (Top) */}
      <View
        className="absolute h-[75%] w-[65%] overflow-hidden rounded-2xl shadow-md"
        style={{
          backgroundColor: FALLBACK_COLORS[0],
          zIndex: 3,
          transform: [{ translateX: -6 }, { rotate: '-8deg' }],
        }}>
        {layerImages[0] ? (
          <Image
            source={{ uri: layerImages[0] }}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>
    </View>
  );
};
