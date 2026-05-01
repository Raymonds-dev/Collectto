import { Modal, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';

interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-4 max-w-sm rounded-2xl bg-surface-card p-6">
          <Text className="font-body text-lg font-bold text-text-base">{title}</Text>
          <Text className="mt-3 text-base text-text-muted">{message}</Text>

          <View className="mt-6 flex-row gap-3">
            <Button
              label={cancelLabel}
              variant="secondary"
              size="md"
              onPress={onCancel}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              label={confirmLabel}
              variant={isDangerous ? 'cancel' : 'primary'}
              size="md"
              loading={isLoading}
              onPress={onConfirm}
              disabled={isLoading}
              className="flex-1"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
