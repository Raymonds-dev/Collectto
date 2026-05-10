import React from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { MotionView } from '@/components/ui/animated';

interface CollectionCreationSuccessProps {
  collectionName: string;
  coverUrl?: string | null;
  onContinue: () => void;
}

export const CollectionCreationSuccess: React.FC<CollectionCreationSuccessProps> = ({
  collectionName,
  coverUrl,
  onContinue,
}) => {
  return (
    <MotionView visible presets={['fade']} className="mt-4">
      <View className="bg-feedback-success-soft border-feedback-success gap-3 rounded-xl border p-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={18} color="#0D8A57" />
          <Text className="text-feedback-success text-sm font-semibold">Coleção criada com sucesso</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} className="h-12 w-12 rounded-lg" />
          ) : (
            <View className="bg-surface-secondary h-12 w-12 items-center justify-center rounded-lg">
              <Ionicons name="images-outline" size={20} color="#888888" />
            </View>
          )}
          <Text className="text-text-primary flex-1 text-sm font-semibold">{collectionName}</Text>
        </View>
        <Button onPress={onContinue} label="Continuar" variant="secondary" />
      </View>
    </MotionView>
  );
};

export default CollectionCreationSuccess;
