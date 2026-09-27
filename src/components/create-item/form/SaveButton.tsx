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
 * SaveButton
 *
 * O que faz: Botão principal de submissão do item com estados visuais de loading ("Salvando..."), acessibilidade e bloqueio quando desabilitado.
 * Onde usar: No rodapé do formulário de criação ou edição de item (`CreateItemFlow`, `ItemMetadataForm`).
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
