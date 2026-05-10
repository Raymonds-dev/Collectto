import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { MotionView } from '@/components/ui/animated';
import { UncategorizedIndicator } from './UncategorizedIndicator';

interface SuccessConfirmationProps {
  itemName: string;
  itemThumbnail?: string;
  isUncategorized?: boolean;
  onDone: () => void;
}

/**
 * SuccessConfirmation component for item creation completion.
 * - Shows success message
 * - Displays created item thumbnail
 * - "Done" button to navigate back
 * - Uses FadeIn motion preset per constitution
 */
export const SuccessConfirmation: React.FC<SuccessConfirmationProps> = ({
  itemName,
  itemThumbnail,
  isUncategorized = false,
  onDone,
}) => {
  return (
    <MotionView visible presets={['fade']} className="flex-1">
      <View className="bg-surface-primary flex-1 items-center justify-center gap-4 px-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-feedback-success">
          <Ionicons name="checkmark" size={32} color="white" />
        </View>

        <Text className="text-text-primary text-center text-2xl font-bold">Item Criado!</Text>

        {itemThumbnail && (
          <View className="border-surface-tertiary h-24 w-24 overflow-hidden rounded-lg border-2">
            <Image
              source={{ uri: itemThumbnail }}
              className="h-full w-full"
              accessibilityLabel={`${itemName} thumbnail`}
            />
          </View>
        )}

        <Text className="text-text-primary text-center text-lg font-medium">{itemName}</Text>
        {isUncategorized ? <UncategorizedIndicator /> : null}

        <Text className="text-text-secondary max-w-xs text-center text-sm">
          Seu item foi adicionado com sucesso.
        </Text>

        <View className="mt-4 w-full max-w-xs">
          <Button onPress={onDone} label="Concluir" accessibilityLabel="Concluir" />
        </View>
      </View>
    </MotionView>
  );
};

export default SuccessConfirmation;
