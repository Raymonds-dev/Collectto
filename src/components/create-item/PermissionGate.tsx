import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { usePhotoPermissions } from '@/hooks/usePhotoPermissions';

interface PermissionGateProps {
  children: React.ReactNode;
}

/**
 * PermissionGate - Guards content behind camera and gallery permissions
 * Checks permissions on mount and displays request UI if not granted.
 * Passes through to children only when both permissions are granted.
 */
export const PermissionGate = ({ children }: PermissionGateProps) => {
  const { requestCameraPermission, requestGalleryPermission } = usePhotoPermissions();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [galleryGranted, setGalleryGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const cameraResult = await requestCameraPermission();
      const galleryResult = await requestGalleryPermission();

      setCameraGranted(cameraResult);
      setGalleryGranted(galleryResult);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requestCameraPermission, requestGalleryPermission]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const goToSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open app settings:', error);
    }
  };

  // All permissions granted - render children
  if (cameraGranted && galleryGranted && !isLoading) {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <View className="bg-surface-default flex-1 items-center justify-center p-6">
        <Text className="text-text-secondary">Verificando permissões...</Text>
      </View>
    );
  }

  // Permissions denied - show error UI
  return (
    <View className="bg-surface-default flex-1 items-center justify-center p-6">
      <View className="bg-surface-container max-w-xs rounded-lg p-6">
        <Text className="text-text-primary mb-2 text-lg font-semibold">Permissões Necessárias</Text>
        <Text className="text-text-secondary mb-6">
          Para acessar fotos e usar a câmera, precisamos de suas permissões.
        </Text>

        {/* Retry button */}
        <Pressable
          onPress={checkPermissions}
          className="mb-3 rounded-md bg-brand-primary px-4 py-3"
          accessibilityRole="button"
          accessibilityLabel="Solicitar permissões novamente">
          <Text className="text-center font-semibold text-text-inverse">Tentar Novamente</Text>
        </Pressable>

        {/* Settings link */}
        <Pressable
          onPress={goToSettings}
          className="bg-surface-variant rounded-md px-4 py-3"
          accessibilityRole="button"
          accessibilityLabel="Ir para configurações do aplicativo">
          <Text className="text-text-primary text-center font-semibold">Ir para Configurações</Text>
        </Pressable>

        <Text className="text-text-tertiary mt-4 text-center text-xs">
          Você pode ativar permissões mais tarde nas configurações do aplicativo.
        </Text>
      </View>
    </View>
  );
};
