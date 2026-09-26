import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useImagePicker } from '@/hooks/useImagePicker';
import { PermissionRequest } from './PermissionRequest';

/**
 * Props for the PermissionGate component.
 */
interface PermissionGateProps {
  /** The content to display once all permissions are granted. */
  children: React.ReactNode;
}

/**
 * A wrapper component that ensures necessary permissions are granted before rendering its children.
 * Specifically checks for camera and photo gallery permissions.
 *
 * Features:
 * - Checks permission status on mount.
 * - Displays a specialized UI (PermissionRequest) to ask for missing permissions.
 * - Provides a fallback with an option to open device settings if permissions are denied.
 * - Pass-through behavior: renders children directly when all permissions are available.
 * - Uses `expo-image-picker` for broad compatibility.
 *
 * @param props - The component props.
 * @returns The children if permitted, otherwise a permission request UI.
 */
export const PermissionGate = ({ children }: PermissionGateProps) => {
  const { getCameraPermission, getGalleryPermission, checkPermissions } = useImagePicker();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [galleryGranted, setGalleryGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState<'camera' | 'gallery' | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const hasCheckedRef = useRef(false);

  // Check current permission status
  const checkPermissionStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await checkPermissions();
      setCameraGranted(status.camera);
      setGalleryGranted(status.gallery);
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setCameraGranted(false);
      setGalleryGranted(false);
    } finally {
      setIsLoading(false);
    }
  }, [checkPermissions]);

  // Initial permission check on mount
  useEffect(() => {
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkPermissionStatus();
    }
  }, [checkPermissionStatus]);

  const handleCameraAllow = useCallback(async () => {
    setRequestLoading(true);
    try {
      const result = await getCameraPermission();
      setCameraGranted(result);
      if (result) {
        setActiveRequest(null);
      }
    } catch (error) {
      console.error('Camera permission request failed:', error);
    } finally {
      setRequestLoading(false);
    }
  }, [getCameraPermission]);

  const handleGalleryAllow = useCallback(async () => {
    setRequestLoading(true);
    try {
      const result = await getGalleryPermission();
      setGalleryGranted(result);
      if (result) {
        setActiveRequest(null);
      }
    } catch (error) {
      console.error('Gallery permission request failed:', error);
    } finally {
      setRequestLoading(false);
    }
  }, [getGalleryPermission]);

  const goToSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open app settings:', error);
    }
  }, []);

  // All permissions granted - render children
  if (cameraGranted && galleryGranted && !isLoading && !activeRequest) {
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

  // Show camera permission request
  if (activeRequest === 'camera') {
    return (
      <PermissionRequest
        type="camera"
        onAllow={handleCameraAllow}
        onDeny={() => setActiveRequest(null)}
        isLoading={requestLoading}
      />
    );
  }

  // Show gallery permission request
  if (activeRequest === 'gallery') {
    return (
      <PermissionRequest
        type="gallery"
        onAllow={handleGalleryAllow}
        onDeny={() => setActiveRequest(null)}
        isLoading={requestLoading}
      />
    );
  }

  // Permissions not fully granted - show request flow
  return (
    <View className="bg-surface-default flex-1 items-center justify-center p-6">
      <View className="bg-surface-container max-w-xs rounded-lg p-6">
        <Text className="text-text-primary mb-2 text-lg font-semibold">Permissões Necessárias</Text>
        <Text className="text-text-secondary mb-6">
          Para criar itens e fotos, precisamos de suas permissões de câmera e galeria.
        </Text>

        {/* Camera permission status */}
        {!cameraGranted && (
          <Pressable
            onPress={() => setActiveRequest('camera')}
            className="mb-3 rounded-md bg-brand-primary px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Solicitar permissão de câmera">
            <Text className="text-center font-semibold text-text-inverse">Permitir Câmera</Text>
          </Pressable>
        )}

        {/* Gallery permission status */}
        {!galleryGranted && (
          <Pressable
            onPress={() => setActiveRequest('gallery')}
            className="mb-3 rounded-md bg-brand-primary px-4 py-3"
            accessibilityRole="button"
            accessibilityLabel="Solicitar permissão de galeria">
            <Text className="text-center font-semibold text-text-inverse">Permitir Galeria</Text>
          </Pressable>
        )}

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
