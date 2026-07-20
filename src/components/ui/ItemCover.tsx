import React from 'react';
import { Image, View } from 'react-native';
import { tokens } from '@/styles/tailwind/tokens.native';

export interface ItemCoverProps {
  /** Array of image URIs to display in the stack */
  images?: string[];
  /** Optional fixed size. If not provided, it fills the parent aspect ratio. */
  size?: number;
  /** Custom classes for the outer container */
  className?: string;
  /** Custom classes for the card rounding, defaults to rounded-2xl */
  roundedClass?: string;
  /** Offset for the stack spread, defaults to 8 */
  stackOffset?: number;
}

const FALLBACK_COLORS = [
  tokens.colors.brand[100],
  tokens.colors.brand[50],
  tokens.colors.surface.muted,
];

/**
 * A standard UI component for displaying items as a backward stack.
 * It always composes three visual layers (duplicating the first image when needed)
 * and applies small vertical offsets so the stack is visible even with a single image.
 */
export const ItemCover = ({
  images = [],
  size,
  className = '',
  roundedClass = 'rounded-2xl',
  stackOffset = 8,
}: ItemCoverProps) => {
  const layerImages = [images[0], images[1] || images[0], images[2] || images[1] || images[0]];
  const stackStep = stackOffset * 1.6;
  const stackInset = stackStep * 2;
  const layerFrameStyle = { top: stackInset, left: 0, right: 0, bottom: 0 };

  return (
    <View
      className={`relative justify-end ${!size ? 'h-full w-full' : ''} ${className}`}
      style={size ? { width: size, height: size + stackInset } : undefined}>
      {/* Layer 3 (Deepest) */}
      <View
        className={`absolute bottom-0 left-0 right-0 overflow-hidden ${roundedClass}`}
        style={{
          backgroundColor: FALLBACK_COLORS[2],
          ...layerFrameStyle,
          transform: [{ translateY: -stackStep * 2 }, { scale: 0.92 }],
          zIndex: 1,
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
        className={`absolute bottom-0 left-0 right-0 overflow-hidden shadow-sm ${roundedClass}`}
        style={{
          backgroundColor: FALLBACK_COLORS[1],
          ...layerFrameStyle,
          transform: [{ translateY: -stackStep }, { scale: 0.96 }],
          zIndex: 2,
        }}>
        {layerImages[1] ? (
          <Image
            source={{ uri: layerImages[1] }}
            className="absolute inset-0 h-full w-full"
            resizeMode="cover"
          />
        ) : null}
      </View>

      {/* Layer 1 (Top/Front) */}
      <View
        className={`absolute bottom-0 left-0 right-0 overflow-hidden border border-surface-border shadow-sm ${roundedClass}`}
        style={{
          backgroundColor: FALLBACK_COLORS[0],
          ...layerFrameStyle,
          transform: [{ translateY: 0 }],
          zIndex: 3,
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
