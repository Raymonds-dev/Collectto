import { useCallback, useState } from 'react';
import { usePhotoPermissions } from './usePhotoPermissions';

interface UsePhotoPermissionsFlowState {
  cameraGranted: boolean;
  galleryGranted: boolean;
  error: string | null;
  isLoading: boolean;
}

interface UsePhotoPermissionsFlowActions {
  requestCamera: () => Promise<boolean>;
  requestGallery: () => Promise<boolean>;
  requestBoth: () => Promise<boolean>;
  reset: () => void;
  clearError: () => void;
}

/**
 * usePhotoPermissionsFlow - Orchestrates permission request flow
 * Tracks grant status, provides error messaging, and retry logic
 */
export const usePhotoPermissionsFlow = (): UsePhotoPermissionsFlowState &
  UsePhotoPermissionsFlowActions => {
  const { requestCameraPermission, requestGalleryPermission } = usePhotoPermissions();
  const [state, setState] = useState<UsePhotoPermissionsFlowState>({
    cameraGranted: false,
    galleryGranted: false,
    error: null,
    isLoading: false,
  });

  const requestCamera = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const granted = await requestCameraPermission();

      setState((prev) => ({
        ...prev,
        cameraGranted: granted,
        isLoading: false,
        error: granted
          ? null
          : 'Permissão de câmera foi negada. Verifique as configurações do aplicativo.',
      }));

      return granted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao solicitar permissão de câmera';
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  }, [requestCameraPermission]);

  const requestGallery = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const granted = await requestGalleryPermission();

      setState((prev) => ({
        ...prev,
        galleryGranted: granted,
        isLoading: false,
        error: granted
          ? null
          : 'Permissão de galeria foi negada. Verifique as configurações do aplicativo.',
      }));

      return granted;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao solicitar permissão de galeria';
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  }, [requestGalleryPermission]);

  const requestBoth = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [cameraGranted, galleryGranted] = await Promise.all([
        requestCameraPermission(),
        requestGalleryPermission(),
      ]);

      let errorMsg: string | null = null;
      if (!cameraGranted && !galleryGranted) {
        errorMsg = 'Ambas as permissões foram negadas. Verifique as configurações do aplicativo.';
      } else if (!cameraGranted || !galleryGranted) {
        errorMsg = 'Uma das permissões foi negada. Verifique as configurações do aplicativo.';
      }

      setState((prev) => ({
        ...prev,
        cameraGranted,
        galleryGranted,
        isLoading: false,
        error: errorMsg,
      }));

      return !errorMsg;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao solicitar permissões';
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return false;
    }
  }, [requestCameraPermission, requestGalleryPermission]);

  const reset = useCallback(() => {
    setState({
      cameraGranted: false,
      galleryGranted: false,
      error: null,
      isLoading: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestCamera,
    requestGallery,
    requestBoth,
    reset,
    clearError,
  };
};
