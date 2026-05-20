import React from 'react';
import { Modal as RNModal, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { tokens } from '@/styles/tailwind/tokens.native';

export type ModalType = 'danger' | 'success' | 'info';

export interface ModalProps {
  /** Determines if the modal is visible */
  visible: boolean;
  /** Function to call when closing the modal */
  onClose: () => void;
  /** Main title of the modal */
  title: string;
  /** Optional description text */
  description?: string;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Function to call when confirming */
  onConfirm?: () => void;
  /** Visual variant of the modal */
  type?: ModalType;
  /** Optional icon to display at the top */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Optional custom content rendered between description and action buttons */
  children?: React.ReactNode;
}

const typeConfig = {
  danger: {
    iconColor: tokens.colors.feedback.error,
    bgClass: 'bg-feedback-errorSoft',
    titleClass: 'text-feedback-error',
    buttonVariant: 'cancel' as const,
  },
  success: {
    iconColor: tokens.colors.feedback.success,
    bgClass: 'bg-feedback-successSoft',
    titleClass: 'text-feedback-success',
    buttonVariant: 'success' as const,
  },
  info: {
    iconColor: tokens.colors.brand.primary,
    bgClass: 'bg-brand-100',
    titleClass: 'text-text-base',
    buttonVariant: 'primary' as const,
  },
};

/**
 * A branded modal component to display alerts, confirmations, or success messages.
 */
export const Modal = ({
  visible,
  onClose,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  type = 'info',
  iconName,
  children,
}: ModalProps) => {
  const config = typeConfig[type];

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-sm rounded-3xl bg-surface-card p-6 shadow-xl">
          {iconName && (
            <View
              className={`mb-4 h-12 w-12 items-center justify-center rounded-full ${config.bgClass}`}>
              <Ionicons name={iconName} size={24} color={config.iconColor} />
            </View>
          )}

          <Text className={`mb-2 text-xl font-bold ${config.titleClass}`}>{title}</Text>

          {description && (
            <Text className="mb-6 text-base leading-6 text-text-muted">{description}</Text>
          )}

          {children}

          <View className="flex-row gap-3">
            {onClose && cancelText && (
              <Button variant="secondary" label={cancelText} onPress={onClose} className="flex-1" />
            )}
            {onConfirm && confirmText && (
              <Button
                variant={config.buttonVariant}
                label={confirmText}
                onPress={onConfirm}
                className="flex-1"
              />
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

export default Modal;
