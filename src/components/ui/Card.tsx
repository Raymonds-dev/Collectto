import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

type CardProps = PropsWithChildren<ViewProps>;

/**
 * Card
 *
 * O que faz: Container agnóstico em formato de cartão com bordas arredondadas (rounded-2xl), borda sutil e fundo contrastante tokens `surface.card`.
 * Onde usar: Para agrupar informações, itens de menu, formulários ou seções de configurações.
 */
export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-surface-border bg-surface-card p-4 ${className ?? ''}`}
      {...props}>
      {children}
    </View>
  );
}
