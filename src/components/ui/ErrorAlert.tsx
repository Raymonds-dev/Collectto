import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MappedError } from '@/types/error';

export interface ErrorAlertProps {
  /** The mapped error object */
  error: MappedError | null;
  /** Callback triggered when retryable action is clicked */
  onRetry?: () => void;
}

export const ErrorAlert = ({ error, onRetry }: ErrorAlertProps) => {
  if (!error) return null;

  // Choose colors/icons based on category
  const getCategoryStyles = () => {
    switch (error.category) {
      case 'TIMEOUT':
      case 'NETWORK':
        return {
          icon: 'wifi-outline' as const,
          bgColor: 'bg-feedback-warningSoft dark:bg-dark-feedback-warningSoft',
          borderColor: 'border-feedback-warning/20 dark:border-dark-feedback-warning/20',
          iconColor: '#FFCC01',
        };
      case 'SERVER':
        return {
          icon: 'server-outline' as const,
          bgColor: 'bg-feedback-errorSoft dark:bg-dark-feedback-errorSoft',
          borderColor: 'border-feedback-error/20 dark:border-dark-feedback-error/20',
          iconColor: '#E53833',
        };
      case 'AUTH':
      case 'CONFLICT':
      case 'VALIDATION':
        return {
          icon: 'alert-circle-outline' as const,
          bgColor: 'bg-feedback-errorSoft dark:bg-dark-feedback-errorSoft',
          borderColor: 'border-feedback-error/20 dark:border-dark-feedback-error/20',
          iconColor: '#E53833',
        };
      default:
        return {
          icon: 'alert-outline' as const,
          bgColor: 'bg-surface-muted dark:bg-dark-surface-muted',
          borderColor: 'border-surface-border dark:border-dark-surface-border',
          iconColor: '#7D7B7B',
        };
    }
  };

  const { icon, bgColor, borderColor, iconColor } = getCategoryStyles();

  return (
    <View
      className={`flex-row items-start rounded-2xl border p-4 ${bgColor} ${borderColor} mb-4`}
      testID="error-alert">
      {/* Icon */}
      <View className="mr-3 mt-0.5">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      {/* Message and actions */}
      <View className="flex-1">
        <Text className="font-body text-lg font-medium text-text-base dark:text-dark-text-base">
          {error.message}
        </Text>

        {/* Diagnostic Code}
        {error.code && (
          <Text className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-subtle dark:text-dark-text-subtle">
            [CÓDIGO: {error.code}]
          </Text>
        )}*/}

        {/* Retry Action */}
        {error.retryable && onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            activeOpacity={0.7}
            className="mt-2 self-start rounded-lg border border-surface-border bg-surface-canvas px-3 py-1.5 shadow-sm dark:border-dark-surface-border dark:bg-dark-surface-canvas"
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente">
            <Text className="font-body text-xs font-semibold text-brand-primary">
              Tentar Novamente
            </Text>
          </TouchableOpacity>
        )}

        {/* Support Link for generic 400 bad request */}
        {error.code === 'BAD_REQUEST_GENERIC' && (
          <TouchableOpacity
            onPress={() => alert('Redirecionando para o canal de suporte...')}
            activeOpacity={0.7}
            className="mt-2 self-start rounded-lg border border-surface-border bg-surface-canvas px-3 py-1.5 shadow-sm dark:border-dark-surface-border dark:bg-dark-surface-canvas"
            accessibilityRole="button"
            accessibilityLabel="Contatar suporte">
            <Text className="font-body text-xs font-semibold text-brand-primary">
              Contatar Suporte
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
