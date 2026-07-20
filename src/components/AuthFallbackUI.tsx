import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MotionView } from './ui/animated';
import { Button } from './ui/Button';
import { AuthErrorInfo, RetryState } from '@/types/authError';

interface AuthFallbackUIProps {
  error: AuthErrorInfo;
  retry: RetryState;
  onRetry: () => void;
  onClearData: () => void;
  testID?: string;
}

export function AuthFallbackUI({
  error,
  retry,
  onRetry,
  onClearData,
  testID = 'auth-fallback-ui',
}: AuthFallbackUIProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorContent = () => {
    switch (error.type) {
      case 'NETWORK':
        return {
          icon: 'wifi-outline' as const,
          iconColor: '#0B6CCD', // infoColor / Blue
          title: 'Sem conexão com a internet',
          description:
            'Verifique a sua rede. O aplicativo tentará se conectar automaticamente assim que a conexão for restabelecida.',
        };
      case 'TIMEOUT':
        return {
          icon: 'time-outline' as const,
          iconColor: '#FFCC01', // warningColor / Yellow
          title: 'Servidor indisponível',
          description:
            'O servidor demorou muito para responder. Pode ser uma lentidão na rede ou manutenção.',
        };
      case 'STORAGE':
        return {
          icon: 'lock-closed-outline' as const,
          iconColor: '#E53833', // errorColor / Red
          title: 'Erro de armazenamento',
          description:
            'Não foi possível acessar a chave de segurança do dispositivo para recuperar sua sessão.',
        };
      case 'PARSING':
        return {
          icon: 'alert-circle-outline' as const,
          iconColor: '#E53833', // errorColor / Red
          title: 'Dados corrompidos',
          description:
            'Os dados de autenticação guardados no dispositivo estão corrompidos ou inválidos.',
        };
      default:
        return {
          icon: 'bug-outline' as const,
          iconColor: '#E53833', // errorColor / Red
          title: 'Ocorreu um erro inesperado',
          description:
            'Houve uma falha na inicialização do aplicativo. Você pode tentar novamente ou limpar os dados.',
        };
    }
  };

  const content = getErrorContent();
  const reachedLimit = retry.attemptCount >= 3;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      className="flex-1 bg-surface-base px-6 py-12"
      testID={testID}>
      <MotionView visible={true} presets={['fade', 'slideUp']} duration={300}>
        <View className="mb-6 items-center rounded-3xl border border-surface-border bg-surface-card p-6 shadow-md">
          {/* Status Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: content.iconColor + '15' }]}
            className="mb-4 items-center justify-center rounded-full p-4">
            <Ionicons name={content.icon} size={48} color={content.iconColor} />
          </View>

          {/* Title */}
          <Text className="mb-3 text-center font-heading text-xl font-bold text-text-base">
            {content.title}
          </Text>

          {/* Description */}
          <Text className="mb-6 text-center font-body text-base leading-6 text-text-muted">
            {content.description}
          </Text>

          {/* Action Buttons */}
          <View className="w-full gap-3">
            {!reachedLimit ? (
              <Button
                label="Tentar Novamente"
                onPress={onRetry}
                loading={retry.isRetrying}
                variant="primary"
                className="w-full"
                accessibilityLabel="Botão Tentar Novamente"
              />
            ) : (
              <Button
                label="Contatar Suporte"
                onPress={() => {
                  // Standard mock support link or action
                  console.log('Contact support tapped');
                }}
                variant="primary"
                className="w-full"
                accessibilityLabel="Botão Contatar Suporte"
              />
            )}

            <Button
              label="Limpar Dados & Sair"
              onPress={onClearData}
              variant="secondary"
              className="w-full"
              accessibilityLabel="Botão Limpar Dados e Sair"
            />
          </View>
        </View>

        {/* Collapsible Technical Details */}
        <View className="mb-4 w-full">
          <Button
            label={showDetails ? 'Ocultar Detalhes Técnicos' : 'Mostrar Detalhes Técnicos'}
            onPress={() => setShowDetails(!showDetails)}
            variant="ghost"
            className="h-10 py-1"
            accessibilityLabel="Botão Mostrar ou Ocultar Detalhes Técnicos"
          />

          {showDetails && (
            <View className="mt-2 rounded-2xl border border-surface-border bg-surface-muted p-4">
              <Text className="mb-1 font-body text-xs text-text-subtle">
                <Text className="font-semibold">Tipo de Erro:</Text> {error.type}
              </Text>
              <Text className="mb-1 font-body text-xs text-text-subtle">
                <Text className="font-semibold">Horário:</Text> {error.timestamp}
              </Text>
              <Text className="mb-2 font-body text-xs text-text-subtle">
                <Text className="font-semibold">Tentativas:</Text> {retry.attemptCount}/3
              </Text>
              <Text className="rounded border border-surface-border bg-surface-card p-2 font-body font-mono text-xs leading-4 text-text-muted">
                {error.technicalMessage}
              </Text>
            </View>
          )}
        </View>
      </MotionView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
  },
});
