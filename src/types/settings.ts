import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export interface SettingsItemConfig {
  id: string;
  label: string;
  description: string;
  action: string;
  isDangerous?: boolean;
}

export interface SettingsSectionConfig {
  icon: IconName;
  title: string;
  description: string;
  items: SettingsItemConfig[];
}
