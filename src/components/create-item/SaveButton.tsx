import React from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Props for the SaveButton component.
 */
interface SaveButtonProps {
  /** Whether the save operation is in progress. */
  isLoading?: boolean;
  /** Whether the button is disabled (e.g., due to invalid form state). */
  isDisabled?: boolean;
  /** Callback function triggered when the button is pressed. */
  onPress: () => void;
  /** Custom label for the button. Defaults to 'Salvar Item'. */
  label?: string;
}

/**
 * SaveButton component for the item creation flow.
 * Displays a button with an optional loading state and customized labeling.
 *
 * - Shows 'Salvando...' when loading.
 * - Disables interaction when loading or when specified by isDisabled.
 * - Leverages the base UI Button component.
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
