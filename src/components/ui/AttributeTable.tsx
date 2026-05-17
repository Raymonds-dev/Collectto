import React from 'react';
import { Text, View } from 'react-native';
import { tokens } from '@/styles/tailwind/tokens.native';

export interface Attribute {
  key?: string;
  value: string;
}

interface AttributeTableProps {
  attributes: Attribute[];
  label?: string;
}

export function AttributeTable({ attributes, label }: AttributeTableProps) {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <View className="w-full">
      {label ? <Text className="mb-2 text-sm font-semibold text-text-muted">{label}</Text> : null}

      <View className="overflow-hidden rounded-2xl border border-surface-border bg-surface-card">
        {attributes.map((attr, index) => {
          const anyAttr = attr as any;
          const displayKey = anyAttr?.key ?? anyAttr?.label ?? `attr-${index + 1}`;
          const displayValue = anyAttr?.value ?? anyAttr?.val ?? String(anyAttr ?? '');

          return (
            <View
              key={`${displayKey}-${index}`}
              className={`flex-row border-b border-surface-border ${index === attributes.length - 1 ? 'border-b-0' : ''}`}>
              <View className="flex-1 border-r border-surface-border">
                <Text
                  style={{ color: tokens.colors.neutral.black }}
                  className="px-3 py-3 font-semibold">
                  {displayKey}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="px-3 py-3 font-extralight text-text-subtle">{displayValue}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
