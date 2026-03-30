import { cloneElement, isValidElement, ReactElement, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export type OptionsBarOption = {
  key: string;
  icon: { icon_node: React.ReactNode; active_color: string; inactive_color: string };
};

type OptionsBarProps = {
  options: OptionsBarOption[];
  renderContent?: (activeTab: string) => React.ReactNode;
};

function DefaultTabContent({ activeTab }: { activeTab: string }) {
  if (activeTab === 'collections') {
    return (
      <View className="mt-4 rounded-2xl border border-surface-border bg-surface-card p-4">
        <Text className="text-base font-semibold text-text-base">Collections</Text>
        <Text className="mt-1 text-sm text-text-muted">Sua area de colecoes aparecera aqui.</Text>
      </View>
    );
  }

  if (activeTab === 'favorites') {
    return (
      <View className="mt-4 rounded-2xl border border-surface-border bg-surface-card p-4">
        <Text className="text-base font-semibold text-text-base">Favorites</Text>
        <Text className="mt-1 text-sm text-text-muted">Seus itens favoritos aparecerao aqui.</Text>
      </View>
    );
  }

  return (
    <View className="mt-4 rounded-2xl border border-surface-border bg-surface-card p-4">
      <Text className="text-base font-semibold text-text-base">{activeTab}</Text>
      <Text className="mt-1 text-sm text-text-muted">Conteudo desta secao.</Text>
    </View>
  );
}

export function OptionsBar({ options, renderContent }: OptionsBarProps) {
  const firstKey = useMemo(() => options[0]?.key ?? '', [options]);
  const [activeTab, setActiveTab] = useState(firstKey);

  useEffect(() => {
    if (!options.some((option) => option.key === activeTab)) {
      setActiveTab(firstKey);
    }
  }, [activeTab, firstKey, options]);

  if (options.length === 0) {
    return null;
  }

  return (
    <View className="w-full">
      <View className="w-full flex-row items-center">
        {options.map((option) => {
          const isActive = option.key === activeTab;
          const iconColor = isActive ? option.icon.active_color : option.icon.inactive_color;

          const iconNode = isValidElement(option.icon.icon_node)
            ? cloneElement(option.icon.icon_node as ReactElement<{ color?: string }>, {
                color: iconColor,
              })
            : option.icon.icon_node;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar aba ${option.key}`}
              accessibilityState={{ selected: isActive }}
              hitSlop={8}
              onPress={() => setActiveTab(option.key)}
              className="relative flex-1 items-center pb-2 pt-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-transparent">
                {iconNode}
              </View>

              {isActive ? (
                <View
                  className="absolute bottom-0 h-[2px] w-10 rounded-full"
                  style={{ backgroundColor: option.icon.active_color }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View className="h-px w-full bg-surface-border" />

      {renderContent ? renderContent(activeTab) : <DefaultTabContent activeTab={activeTab} />}
    </View>
  );
}
