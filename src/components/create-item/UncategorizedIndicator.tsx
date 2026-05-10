import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export const UncategorizedIndicator: React.FC = () => {
  return (
    <View className="bg-feedback-warning-soft flex-row items-center gap-2 self-center rounded-full px-3 py-1">
      <Ionicons name="pricetag-outline" size={14} color="#7A4A00" />
      <Text className="text-xs font-semibold text-feedback-warning">Uncategorized</Text>
    </View>
  );
};

export default UncategorizedIndicator;
