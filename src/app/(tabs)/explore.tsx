import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AnimatedPressable, MotionView } from '@/components/ui/animated';
import { MOCK_EXPLORE_CATEGORIES, MOCK_EXPLORE_SPOTLIGHTS } from '@/mocks/explore';
import type { ExploreCategory, ExploreSpotlight } from '@/mocks/explore';
import { tokens } from '@/styles/tailwind/tokens.native';

type ExploreColumnProps = {
  cards: ExploreSpotlight[];
  onOpenCard: (card: ExploreSpotlight) => void;
};

type CategoryChipProps = {
  category: ExploreCategory;
  isSelected: boolean;
  onPress: (categoryId: string) => void;
};

const ExploreScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSpotlight, setSelectedSpotlight] = useState<ExploreSpotlight | null>(null);

  const filteredCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return MOCK_EXPLORE_SPOTLIGHTS.filter((card) => {
      const matchesCategory =
        selectedCategoryId === 'all' || card.categoryId === selectedCategoryId;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [card.title, card.subtitle, ...card.tags].join(' ').toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery, selectedCategoryId]);

  const leftColumnCards = filteredCards.filter((_, index) => index % 2 === 0);
  const rightColumnCards = filteredCards.filter((_, index) => index % 2 === 1);

  const handleOpenCard = (card: ExploreSpotlight) => {
    setSelectedSpotlight(card);
  };

  const handleCloseSheet = () => {
    setSelectedSpotlight(null);
  };

  const handleOpenCollection = (collectionId: string) => {
    router.push({
      pathname: '/(tabs)/collections/[collectionId]',
      params: { collectionId },
    });
    handleCloseSheet();
  };

  return (
    <View className="flex-1 bg-surface-base">
      <MotionView className="mb-4" visible presets={['slideDown', 'fade']} duration={260}>
        <View className="mb-3">
          <Text className="self-center text-center font-poetsenone text-2xl uppercase tracking-[0.04em] text-text-base">
            Explorar
          </Text>
          <Text className="text-mg ml-3 mt-2 leading-5 text-text-muted">
            Encontre itens e coleções que combinam com seu interesse...
          </Text>
        </View>

        <View className="w-[94%] flex-row items-center gap-4 self-center rounded-2xl border border-black bg-surface-card px-4 py-2">
          <Ionicons name="search" size={18} color={tokens.colors.brand.primary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Pesquise por itens, carros, cards..."
            placeholderTextColor={tokens.colors.text.muted}
            className="flex-1 text-base text-text-base"
            returnKeyType="search"
          />
        </View>
      </MotionView>

      <View className="mb-5">
        <Text className="mb-3 ml-4 text-sm font-medium text-text-base">Filtros rápidos</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}>
          {MOCK_EXPLORE_CATEGORIES.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isSelected={selectedCategoryId === category.id}
              onPress={setSelectedCategoryId}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {filteredCards.length ? (
          <View className="flex-row gap-3">
            <ExploreColumn cards={leftColumnCards} onOpenCard={handleOpenCard} />
            <ExploreColumn cards={rightColumnCards} onOpenCard={handleOpenCard} />
          </View>
        ) : (
          <View className="items-center rounded-3xl border border-dashed border-surface-border bg-surface-card px-5 py-10">
            <Ionicons name="search-outline" size={28} color={tokens.colors.text.muted} />
            <Text className="mt-3 text-center text-base font-medium text-text-base">
              Nenhum resultado encontrado
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-text-muted">
              Ajuste o filtro ou tente outra palavra-chave para encontrar coleções parecidas.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(selectedSpotlight)}
        onRequestClose={handleCloseSheet}>
        <View style={styles.sheetBackdrop}>
          {selectedSpotlight ? (
            <Image
              source={selectedSpotlight.images[0]}
              style={styles.backdropBlurImage}
              resizeMode="cover"
              blurRadius={18}
            />
          ) : null}
          <View style={styles.backdropScrim} />

          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Fechar detalhes da coleção"
            onPress={handleCloseSheet}
            style={styles.sheetDismissArea}
          />

          <MotionView
            visible={Boolean(selectedSpotlight)}
            presets={['scaleFade', 'fade']}
            duration={260}
            className="rounded-3xl border border-surface-border px-4 pb-6 pt-4"
            style={styles.centerModalCard}>
            {selectedSpotlight ? (
              <>
                <View className="mb-3 flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-poetsenone text-xl text-text-base">
                      {selectedSpotlight.title}
                    </Text>
                    <Text className="mt-1 text-xs text-text-muted">
                      postado por @{selectedSpotlight.postedBy} • {selectedSpotlight.postedAt}
                    </Text>
                  </View>

                  <AnimatedPressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel da coleção"
                    onPress={handleCloseSheet}
                    className="h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-surface-muted">
                    <Ionicons name="close" size={18} color={tokens.colors.text.base} />
                  </AnimatedPressable>
                </View>

                <FlatList
                  horizontal
                  data={selectedSpotlight.images}
                  keyExtractor={(_, index) => `sheet-image-${index}`}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sheetImagesContent}
                  renderItem={({ item }) => (
                    <Image source={item} style={styles.sheetImage} resizeMode="cover" />
                  )}
                />

                <Text className="mb-1 mt-3 text-sm font-medium text-text-base">
                  Sobre a coleção
                </Text>
                <Text className="text-sm leading-5 text-text-muted">
                  {selectedSpotlight.subtitle}
                </Text>

                <View className="mb-2 mt-3 flex-row flex-wrap gap-2">
                  {selectedSpotlight.tags.map((tag) => (
                    <View key={tag} className="rounded-full bg-brand-50 px-3 py-1">
                      <Text className="text-xs font-medium text-brand-primary">{tag}</Text>
                    </View>
                  ))}
                </View>

                <AnimatedPressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir coleção ${selectedSpotlight.title}`}
                  onPress={() => handleOpenCollection(selectedSpotlight.collectionId)}
                  className="mt-4 min-h-11 items-center justify-center rounded-2xl bg-brand-primary px-4 py-3">
                  <Text className="font-body text-sm font-semibold text-text-inverse">
                    Ver coleção completa
                  </Text>
                </AnimatedPressable>
              </>
            ) : null}
          </MotionView>
        </View>
      </Modal>
    </View>
  );
};

const ExploreColumn = ({ cards, onOpenCard }: ExploreColumnProps) => {
  return (
    <View className="flex-1 gap-3">
      {cards.map((card, index) => (
        <MotionView
          key={card.id}
          visible
          presets={['scaleFade']}
          duration={280}
          delay={index * 70}
          style={[styles.cardShadow, { height: card.height }]}>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir detalhes da coleção ${card.title}`}
            onPress={() => onOpenCard(card)}
            style={styles.card}
            motionStyle={styles.cardMotion}>
            <StackedPreview images={card.images} tags={card.tags} caption={card.caption} />
          </AnimatedPressable>
        </MotionView>
      ))}
    </View>
  );
};

type StackedPreviewProps = {
  images: ImageSourcePropType[];
  tags: string[];
  caption: string;
};

const StackedPreview = ({ images, tags, caption }: StackedPreviewProps) => {
  const primaryImage = images[0];

  if (!primaryImage) {
    return null;
  }

  const middleImage = images[1] ?? primaryImage;
  const backImage = images[2] ?? middleImage;

  return (
    <View style={styles.imageStackRoot}>
      <Image source={backImage} style={[styles.stackImage, styles.stackBack]} blurRadius={10} />
      <Image source={middleImage} style={[styles.stackImage, styles.stackMiddle]} blurRadius={6} />
      <Image source={primaryImage} style={[styles.stackImage, styles.stackFront]} />

      <View style={styles.frontImageOverlay}>
        <View className="mb-2 flex-row flex-wrap gap-1.5">
          {tags.map((tag) => (
            <View key={tag} className="rounded-full bg-overlay-scrimSoft px-2.5 py-1">
              <Text className="text-[10px] font-semibold text-text-inverse">{tag}</Text>
            </View>
          ))}
        </View>

        <Text numberOfLines={2} className="text-sm font-medium leading-5 text-text-inverse">
          {caption}
        </Text>
      </View>
    </View>
  );
};

const CategoryChip = ({ category, isSelected, onPress }: CategoryChipProps) => {
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Filtrar por ${category.label}`}
      onPress={() => onPress(category.id)}
      style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
      motionStyle={styles.chipMotion}>
      <Text
        style={[
          styles.chipLabel,
          isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
        ]}>
        {category.label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  collectionScroll: {
    flex: 1,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 8,
  },
  card: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cardShadow: {
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },
  cardMotion: {
    width: '100%',
  },
  imageStackRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackImage: {
    position: 'absolute',
    width: '94%',
    height: '96%',
    borderRadius: 20,
  },
  stackFront: {
    zIndex: 3,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  stackMiddle: {
    zIndex: 2,
    opacity: 0.92,
    transform: [{ translateY: -12 }, { scale: 0.96 }],
  },
  stackBack: {
    zIndex: 1,
    opacity: 0.86,
    transform: [{ translateY: -24 }, { scale: 0.92 }],
  },
  frontImageOverlay: {
    position: 'absolute',
    zIndex: 4,
    width: '94%',
    height: '96%',
    borderRadius: 20,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.2)',
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipMotion: {
    alignSelf: 'flex-start',
  },
  chipSelected: {
    backgroundColor: tokens.colors.brand.primary,
    borderColor: tokens.colors.brand.primary,
  },
  chipUnselected: {
    backgroundColor: tokens.colors.surface.card,
    borderColor: tokens.colors.surface.border,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: tokens.colors.text.inverse,
  },
  chipLabelUnselected: {
    color: tokens.colors.text.base,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropBlurImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
  },
  sheetDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  centerModalCard: {
    width: '92%',
    maxWidth: 480,
    minHeight: '78%',
    maxHeight: '92%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  sheetImagesContent: {
    gap: 10,
    paddingRight: 6,
  },
  sheetImage: {
    width: 240,
    height: 350,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default ExploreScreen;
