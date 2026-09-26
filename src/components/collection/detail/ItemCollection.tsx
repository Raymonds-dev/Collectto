import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useRef, useState } from 'react';
import { MOCK_ITEM_DETAIL_PLACEHOLDER_IMAGE } from '@/mocks';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  type TextLayoutEvent,
  useWindowDimensions,
  View,
} from 'react-native';

import { AnimatedPressable } from '@/components/ui/animated';
import { ItemCover } from '@/components/ui/ItemCover';
import { tokens } from '@/styles/tailwind/tokens.native';
import { AttributeTable } from '@/components/ui/AttributeTable';

type ItemCharacteristic = {
  label: string;
  value: string;
};

type ItemCollectionProps = {
  title: string;
  images: string[];
  acquiredDate: string;
  lastUsedDate: string;
  description: string;
  characteristics: ItemCharacteristic[];
};

const DESCRIPTION_MAX_LINES = 4;

function GradientDivider() {
  const brandJourney = tokens.gradients.brandJourney as string[];
  const dividerGradient: readonly [string, string, string, string] = [
    brandJourney[0] ?? tokens.colors.brand.primary,
    brandJourney[1] ?? tokens.colors.feedback.success,
    brandJourney[2] ?? tokens.colors.feedback.warning,
    brandJourney[3] ?? tokens.colors.feedback.info,
  ];

  return (
    <LinearGradient
      colors={dividerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientDivider}
    />
  );
}

export function ItemCollection({
  title,
  images,
  acquiredDate,
  lastUsedDate,
  description,
  characteristics,
}: ItemCollectionProps) {
  const { width, height } = useWindowDimensions();
  const galleryListRef = useRef<FlatList<string>>(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [hasDescriptionOverflow, setHasDescriptionOverflow] = useState(false);

  const imageStack = useMemo(() => images.slice(0, 3), [images]);
  const safeImages = images.length > 0 ? images : [MOCK_ITEM_DETAIL_PLACEHOLDER_IMAGE];

  function handleOpenGallery(index = 0) {
    setActiveImageIndex(index);
    setIsGalleryOpen(true);
  }

  function handleDescriptionLayout(event: TextLayoutEvent) {
    if (isDescriptionExpanded) {
      return;
    }

    const hasOverflow = event.nativeEvent.lines.length > DESCRIPTION_MAX_LINES;
    if (hasOverflow !== hasDescriptionOverflow) {
      setHasDescriptionOverflow(hasOverflow);
    }
  }

  // using ItemCover for stacked item images

  return (
    <View className="w-full gap-5 px-5 py-6">
      <Text className="text-center font-poetsenone text-[30px] leading-[34px] text-brand-primary">
        {title}
      </Text>

      <GradientDivider />

      <View className="items-center pt-7">
        <View className="w-full max-w-[420px]">
          <View className="relative aspect-square w-full">
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir galeria de ${title}`}
              onPress={() => handleOpenGallery(0)}
              className="h-full w-full overflow-hidden">
              <ItemCover
                images={imageStack.length ? imageStack : safeImages}
                roundedClass="rounded-[20px]"
                stackOffset={12}
              />
            </AnimatedPressable>
          </View>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <View className="min-w-[48%] flex-row items-center gap-1">
          <Text className="font-poetsenone text-xs text-text-base">Adquirido em:</Text>
          <Text className="font-body text-xs font-extralight text-text-subtle">{acquiredDate}</Text>
        </View>

        <View className="min-w-[48%] flex-row items-center justify-end gap-1">
          <Text className="font-poetsenone text-xs text-text-base">Usado pela ultima vez:</Text>
          <Text className="font-body text-xs font-extralight text-text-subtle">{lastUsedDate}</Text>
        </View>
      </View>

      <View className="gap-1">
        <Text
          className="font-body text-sm leading-6 text-text-muted"
          numberOfLines={isDescriptionExpanded ? undefined : DESCRIPTION_MAX_LINES}
          onTextLayout={handleDescriptionLayout}>
          {description}
        </Text>

        {hasDescriptionOverflow ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={isDescriptionExpanded ? 'Recolher descricao' : 'Expandir descricao'}
            onPress={() => setIsDescriptionExpanded((current) => !current)}
            className="self-start py-1">
            <Text className="font-poetsenone text-xs text-brand-primary">
              {isDescriptionExpanded ? 'ver menos' : 'ver mais'}
            </Text>
          </AnimatedPressable>
        ) : null}
      </View>

      <GradientDivider />

      <Text className="font-poetsenone text-xl text-brand-primary">Caracteristicas</Text>

      <View className="gap-2 pb-1">
        <AttributeTable attributes={characteristics} />
      </View>

      <Modal
        visible={isGalleryOpen}
        animationType="fade"
        transparent
        onShow={() => {
          galleryListRef.current?.scrollToIndex({ index: activeImageIndex, animated: false });
        }}
        onRequestClose={() => setIsGalleryOpen(false)}>
        <View className="flex-1 bg-overlay-scrim">
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Fechar galeria"
            onPress={() => setIsGalleryOpen(false)}
            className="absolute right-6 top-16 z-10 rounded-full border border-surface-border bg-surface-card px-4 py-2">
            <Text className="font-poetsenone text-sm text-text-base">Fechar</Text>
          </AnimatedPressable>

          <FlatList
            ref={galleryListRef}
            data={safeImages}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({
              index,
              length: width,
              offset: width * index,
            })}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <View style={{ width, height }} className="items-center justify-center">
                <Image
                  source={{ uri: item }}
                  resizeMode="contain"
                  className="h-[78%] w-[92%] rounded-2xl"
                />
              </View>
            )}
          />

          <View className="absolute bottom-12 w-full items-center">
            <Text className="font-poetsenone text-sm text-text-inverse">
              {activeImageIndex + 1} / {safeImages.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// legacy image layer helper removed

const styles = StyleSheet.create({
  gradientDivider: {
    borderRadius: 999,
    height: 2,
    marginHorizontal: 10,
    width: 'auto',
  },
  // legacy image layer styles removed (now using ItemCover)
});
