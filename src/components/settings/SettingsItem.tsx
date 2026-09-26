import { Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AnimatedPressable } from '@/components/ui/animated';
import { tokens } from '@/styles/tailwind/tokens.native';

interface SettingsItemProps {
  label: string;
  description?: string;
  onPress: () => void;
  isDangerous?: boolean;
  showArrow?: boolean;
}

/**
 * SettingsItem
 *
 * O que faz: Linha clicável de opção de configuração com rótulo, descrição secundária, seta de navegação e destaque visual para ações perigosas (ex: excluir conta).
 * Onde usar: Dentro de seções de configurações (`SettingsSection`) em telas como `src/app/(tabs)/settings/support.tsx` e demais subrotas de settings.
 */
export function SettingsItem({
  label,
  description,
  onPress,
  isDangerous = false,
  showArrow = true,
}: SettingsItemProps) {
  const arrowColor = isDangerous ? tokens.colors.feedback.error : tokens.colors.text.muted;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-surface-border px-4 py-4 last:border-b-0">
      <View className="flex-1">
        <Text
          className={`font-body font-semibold ${isDangerous ? 'text-feedback-error' : 'text-text-base'}`}>
          {label}
        </Text>
        {description ? <Text className="mt-1 text-sm text-text-muted">{description}</Text> : null}
      </View>
      {showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={arrowColor} style={{ marginLeft: 8 }} />
      ) : null}
    </AnimatedPressable>
  );
}
