import { useEffect, useMemo, useRef, useState } from 'react';
import type { ElementRef } from 'react';
import { Dimensions, Modal, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
  type PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';
import { Button } from '@/components/ui/Button';

interface ProfilePhotoCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}

const clampValue = (value: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

export function ProfilePhotoCropModal({
  visible,
  imageUri,
  onCancel,
  onConfirm,
}: ProfilePhotoCropModalProps) {
  const viewShotRef = useRef<ElementRef<typeof ViewShot> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { width } = Dimensions.get('window');
  const cropSize = useMemo(() => Math.min(width - 64, 320), [width]);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      startScale.value = 1;
      startTranslateX.value = 0;
      startTranslateY.value = 0;
    }
  }, [visible, scale, startScale, startTranslateX, startTranslateY, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startTranslateX.value = translateX.value;
      startTranslateY.value = translateY.value;
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      translateX.value = startTranslateX.value + event.translationX;
      translateY.value = startTranslateY.value + event.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event: GestureUpdateEvent<PinchGestureHandlerEventPayload>) => {
      scale.value = clampValue(startScale.value * event.scale, 1, 3);
    });

  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleConfirm = async (): Promise<void> => {
    if (!viewShotRef.current || !imageUri) {
      return;
    }

    try {
      setIsSaving(true);
      const capturedUri = await viewShotRef.current.capture?.();
      if (capturedUri) {
        onConfirm(capturedUri);
      }
    } catch (error) {
      console.error('Erro ao recortar a imagem:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!visible || !imageUri) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-overlay-scrim px-6">
        <View className="w-full max-w-md rounded-2xl bg-surface-card p-6">
          <Text className="font-poetsenone text-xl text-text-base">Ajuste sua foto</Text>
          <Text className="mt-2 text-sm text-text-muted">Arraste para reposicionar a foto</Text>

          <View className="mt-6 items-center justify-center">
            <View style={{ width: cropSize, height: cropSize }}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: 'png', quality: 1, result: 'tmpfile' }}
                style={{
                  width: cropSize,
                  height: cropSize,
                  borderRadius: cropSize / 2,
                  overflow: 'hidden',
                }}>
                <GestureDetector gesture={gesture}>
                  <Animated.Image
                    source={{ uri: imageUri }}
                    style={[{ width: cropSize, height: cropSize }, imageStyle]}
                    resizeMode="cover"
                  />
                </GestureDetector>
              </ViewShot>

              <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                <View
                  className="border-brand-primary"
                  style={{
                    width: cropSize,
                    height: cropSize,
                    borderRadius: cropSize / 2,
                    borderWidth: 2,
                  }}
                />
              </View>
            </View>
          </View>

          <View className="mt-6 flex-row gap-3">
            <Button
              label="Cancelar"
              variant="ghost"
              size="md"
              className="flex-1"
              onPress={onCancel}
              disabled={isSaving}
            />
            <Button
              label="Confirmar"
              variant="primary"
              size="md"
              className="flex-1"
              onPress={handleConfirm}
              loading={isSaving}
              disabled={isSaving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
