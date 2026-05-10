import React from 'react';
import { Button } from '@/components/ui/Button';

interface SaveButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  label?: string;
}

/**
 * SaveButton component for item creation flow.
 * - Shows "Salvar Item" text or loading state
 * - Disabled during save operation
 * - Shows loading spinner
 * - Accessibility role and label
 * - Uses existing Button component from src/components/ui/
 */
export const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading = false,
  isDisabled = false,
  onPress,
  label = 'Salvar Item',
}) => {
  const isButtonDisabled = isDisabled || isLoading;

  return (
    <Button
      onPress={onPress}
      disabled={isButtonDisabled}
      label={isLoading ? 'Salvando...' : label}
      loading={isLoading}
      variant="primary"
      size="lg"
      accessibilityLabel={label}
      accessibilityHint="Toque duas vezes para salvar seu item"
      accessibilityState={{ disabled: isButtonDisabled }}
    />
  );
};

export default SaveButton;
