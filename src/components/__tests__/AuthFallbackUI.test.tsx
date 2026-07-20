import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AuthFallbackUI } from '../AuthFallbackUI';
import { AuthErrorInfo, RetryState } from '@/types/authError';

describe('AuthFallbackUI Component Tests', () => {
  const mockError: AuthErrorInfo = {
    type: 'STORAGE',
    message: 'Falha ao acessar o armazenamento seguro do dispositivo.',
    technicalMessage: 'SecureStore failure: keychain locked',
    timestamp: new Date().toISOString(),
  };

  const mockRetry: RetryState = {
    attemptCount: 0,
    isRetrying: false,
  };

  const mockOnRetry = jest.fn();
  const mockOnClearData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with error details', () => {
    const { getByText } = render(
      <AuthFallbackUI
        error={mockError}
        retry={mockRetry}
        onRetry={mockOnRetry}
        onClearData={mockOnClearData}
      />
    );

    expect(getByText('Erro de armazenamento')).toBeTruthy();
    expect(
      getByText(
        'Não foi possível acessar a chave de segurança do dispositivo para recuperar sua sessão.'
      )
    ).toBeTruthy();
  });

  it('should call onRetry when Tentar Novamente is pressed', () => {
    const { getByText } = render(
      <AuthFallbackUI
        error={mockError}
        retry={mockRetry}
        onRetry={mockOnRetry}
        onClearData={mockOnClearData}
      />
    );

    const retryButton = getByText('Tentar Novamente');
    fireEvent.press(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should call onClearData when Limpar Dados & Sair is pressed', () => {
    const { getByText } = render(
      <AuthFallbackUI
        error={mockError}
        retry={mockRetry}
        onRetry={mockOnRetry}
        onClearData={mockOnClearData}
      />
    );

    const clearButton = getByText('Limpar Dados & Sair');
    fireEvent.press(clearButton);

    expect(mockOnClearData).toHaveBeenCalledTimes(1);
  });

  it('should toggle technical details visibility', () => {
    const { getByText, queryByText } = render(
      <AuthFallbackUI
        error={mockError}
        retry={mockRetry}
        onRetry={mockOnRetry}
        onClearData={mockOnClearData}
      />
    );

    expect(queryByText('SecureStore failure: keychain locked')).toBeNull();

    const toggleButton = getByText('Mostrar Detalhes Técnicos');
    fireEvent.press(toggleButton);

    expect(getByText('SecureStore failure: keychain locked')).toBeTruthy();
    expect(getByText('Tipo de Erro: STORAGE')).toBeTruthy();

    fireEvent.press(getByText('Ocultar Detalhes Técnicos'));
    expect(queryByText('SecureStore failure: keychain locked')).toBeNull();
  });
});
