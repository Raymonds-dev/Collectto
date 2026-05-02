import { Route } from 'expo-router';
import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface SettingsItemConfig {
  label: string;
  description: string;
  screen: Route<string>;
  isDangerous?: boolean;
}

export interface SettingsSectionConfig {
  icon: IconName;
  title: string;
  description: string;
  items: SettingsItemConfig[];
}
