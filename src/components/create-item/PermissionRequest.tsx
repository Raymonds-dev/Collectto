import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type PermissionType = 'camera' | 'gallery';

interface PermissionRequestProps {
  type: PermissionType;
  onAllow: () => void;
  onDeny: () => void;
  isLoading?: boolean;
}

/**
 * PermissionRequest - UI component for requesting camera or gallery permission
 * Shows explanation and Allow/Deny buttons with accessibility labels
 */
export const PermissionRequest = ({
  type,
  onAllow,
  onDeny,
  isLoading = false,
}: PermissionRequestProps) => {
  const getContent = () => {
    switch (type) {
      case 'camera':
        return {
          icon: 'camera' as const,
          title: 'Acesso à Câmera',
          description: 'Precisamos de permissão para tirar fotos com a câmera do seu dispositivo.',
          allowLabel: 'Permitir Câmera',
        };
      case 'gallery':
        return {
          icon: 'image' as const,
          title: 'Acesso à Galeria',
          description: 'Precisamos de permissão para acessar as fotos da sua galeria.',
          allowLabel: 'Permitir Galeria',
        };
    }
  };

  const content = getContent();

  return (
    <View className="bg-surface-default flex-1 items-center justify-center p-6">
      <View className="bg-surface-container max-w-sm items-center rounded-2xl p-8">
        {/* Icon */}
        <View className="mb-6 rounded-full bg-brand-primary p-4">
          <Ionicons name={content.icon} size={32} color="#ffffff" />
        </View>

        {/* Title */}
        <Text className="text-text-primary mb-2 text-center text-xl font-bold">
          {content.title}
        </Text>

        {/* Description */}
        <Text className="text-text-secondary mb-8 text-center">{content.description}</Text>

        {/* Allow button */}
        <Pressable
          onPress={onAllow}
          disabled={isLoading}
          className={`mb-3 w-full rounded-lg px-6 py-3 ${
            isLoading ? 'bg-brand-primary opacity-50' : 'bg-brand-primary'
          }`}
          accessibilityRole="button"
          accessibilityLabel={content.allowLabel}
          accessibilityHint="Permite o acesso solicitado">
          <Text className="text-center font-semibold text-text-inverse">{content.allowLabel}</Text>
        </Pressable>

        {/* Deny button */}
        <Pressable
          onPress={onDeny}
          disabled={isLoading}
          className={`w-full rounded-lg px-6 py-3 ${
            isLoading ? 'bg-surface-variant opacity-50' : 'bg-surface-variant'
          }`}
          accessibilityRole="button"
          accessibilityLabel="Recusar"
          accessibilityHint="Nega a permissão solicitada">
          <Text className="text-text-primary text-center font-semibold">Recusar</Text>
        </Pressable>

        {/* Info text */}
        <Text className="text-text-tertiary mt-6 text-center text-xs">
          Você pode alterar essa permissão a qualquer momento nas configurações do aplicativo.
        </Text>
      </View>
    </View>
  );
};
