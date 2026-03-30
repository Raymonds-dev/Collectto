import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

type CardProps = PropsWithChildren<ViewProps>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-surface-border bg-surface-card p-4 ${className ?? ''}`}
      {...props}>
      {children}
    </View>
  );
}
