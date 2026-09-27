import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, PanResponder, Image as RNImage, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';

export interface ProfilePhotoCropModalProps {
  visible: boolean;
  imageUri: string | null;
  onCancel: () => void;
  onConfirm: (croppedUri: string) => void;
}

const OUTPUT_SIZE = 512;

export const ProfilePhotoCropModal = ({
  visible,
  imageUri,
  onCancel,
  onConfirm,
}: ProfilePhotoCropModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const containerRef = useRef<View | null>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  currentPosRef.current = { x: translateX, y: translateY };

  const { width } = Dimensions.get('window');
  const cropSize = useMemo(() => Math.min(width - 64, 320), [width]);

  useEffect(() => {
    if (visible) {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
      startPosRef.current = { x: 0, y: 0 };
    }

    const el = containerRef.current as unknown as HTMLElement | null;
    if (!el || typeof el.addEventListener !== 'function') {
      return;
    }

    const onWheel = (e: WheelEvent): void => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      setScale((prev) => Math.min(Math.max(+(prev + delta).toFixed(2), 1), 3));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startPosRef.current = { ...currentPosRef.current };
        },
        onPanResponderMove: (_evt, gestureState) => {
          setTranslateX(startPosRef.current.x + gestureState.dx);
          setTranslateY(startPosRef.current.y + gestureState.dy);
        },
      }),
    []
  );

  const handleZoomIn = (): void => {
    setScale((prev) => Math.min(+(prev + 0.2).toFixed(2), 3));
  };

  const handleZoomOut = (): void => {
    setScale((prev) => Math.max(+(prev - 0.2).toFixed(2), 1));
  };

  const handleReset = (): void => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!imageUri || typeof document === 'undefined') {
      return;
    }

    try {
      setIsSaving(true);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUri;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Falha ao carregar a imagem para recorte.'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
      }

      const imgAspect = img.naturalWidth / img.naturalHeight;
      const factor = OUTPUT_SIZE / cropSize;

      // Desenha com antialiasing de alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.save();
      // Aplica a escala para resolução de saída (512x512)
      ctx.scale(factor, factor);

      // Translada para o centro do viewport de crop mais o deslocamento do usuário
      ctx.translate(cropSize / 2 + translateX, cropSize / 2 + translateY);
      ctx.scale(scale, scale);

      // Calcula as dimensões para equivalência ao resizeMode="cover"
      let drawW = cropSize;
      let drawH = cropSize;
      if (imgAspect > 1) {
        drawW = cropSize * imgAspect;
        drawH = cropSize;
      } else {
        drawW = cropSize;
        drawH = cropSize / imgAspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const croppedDataUrl = canvas.toDataURL('image/png');
      onConfirm(croppedDataUrl);
    } catch (error) {
      console.error('Erro ao recortar a imagem via Canvas na Web:', error);
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
          <Text className="mt-2 text-sm text-text-muted">
            Arraste para reposicionar ou use a roda do mouse e botões para zoom.
          </Text>

          <View className="mt-6 items-center justify-center">
            {/* Viewport de recorte circular */}
            <View
              style={{
                width: cropSize,
                height: cropSize,
                borderRadius: cropSize / 2,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
              }}
              ref={containerRef}
              {...panResponder.panHandlers}>
              <View
                style={{
                  width: cropSize,
                  height: cropSize,
                  transform: [{ translateX }, { translateY }, { scale }],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <RNImage
                  source={{ uri: imageUri }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  resizeMode="cover"
                />
              </View>

              {/* Borda delimitadora */}
              <View
                className="pointer-events-none absolute inset-0 items-center justify-center"
                style={{
                  width: cropSize,
                  height: cropSize,
                  borderRadius: cropSize / 2,
                  borderWidth: 2,
                  borderColor: '#F8B179',
                }}
              />
            </View>
          </View>

          {/* Controles de Zoom */}
          <View className="mt-4 flex-row items-center justify-center gap-4">
            <Button
              label="−"
              variant="secondary"
              size="sm"
              onPress={handleZoomOut}
              disabled={scale <= 1 || isSaving}
              accessibilityLabel="Diminuir zoom"
            />
            <Text className="min-w-[48px] text-center text-sm font-medium text-text-base">
              {Math.round(scale * 100)}%
            </Text>
            <Button
              label="+"
              variant="secondary"
              size="sm"
              onPress={handleZoomIn}
              disabled={scale >= 3 || isSaving}
              accessibilityLabel="Aumentar zoom"
            />
            {(scale > 1 || translateX !== 0 || translateY !== 0) && (
              <Button
                label="Redefinir"
                variant="ghost"
                size="sm"
                onPress={handleReset}
                disabled={isSaving}
                accessibilityLabel="Redefinir enquadramento"
              />
            )}
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
};

export default ProfilePhotoCropModal;
