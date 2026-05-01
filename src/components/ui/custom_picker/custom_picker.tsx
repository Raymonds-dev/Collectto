import React, { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usaremos um ícone de seta
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/ui/animated/AnimatedPressable';
import { tokens } from '@/styles/tailwind/tokens.native';

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  items: PickerItem[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
  onPressOverride?: () => void;
  triggerClassName?: string;
  triggerTextClassName?: string;
}

const Separador = () => <View style={{ height: 12 }} />;

interface AnimatedPickerOptionProps {
  item: PickerItem;
  isSelected: boolean;
  onSelect: (item: PickerItem) => void;
}

const AnimatedPickerOption = ({ item, isSelected, onSelect }: AnimatedPickerOptionProps) => {
  const pressProgress = useSharedValue(0);

  const itemAnimatedStyle = useAnimatedStyle(() => {
    const baseBackground = isSelected ? tokens.colors.brand[50] : tokens.colors.surface.canvas;
    const baseBorder = isSelected ? tokens.colors.brand.primary : tokens.colors.surface.border;

    return {
      backgroundColor: interpolateColor(
        pressProgress.value,
        [0, 1],
        [baseBackground, tokens.colors.brand[100]]
      ),
      borderColor: interpolateColor(
        pressProgress.value,
        [0, 1],
        [baseBorder, tokens.colors.brand.primary]
      ),
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      pressProgress.value,
      [0, 1],
      [tokens.colors.text.base, tokens.colors.brand[700]]
    ),
  }));

  const handlePressIn = (): void => {
    pressProgress.value = withTiming(1, { duration: tokens.motion.duration.pressIn });
  };

  const handlePressOut = (): void => {
    pressProgress.value = withTiming(0, { duration: tokens.motion.duration.pressOut });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`Selecionar ${item.label}`}
      motionStyle={itemAnimatedStyle}
      onPress={() => onSelect(item)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.item}>
      <Animated.Text style={[styles.itemText, textAnimatedStyle]}>{item.label}</Animated.Text>
    </AnimatedPressable>
  );
};

export function CustomPicker({
  items,
  selectedValue,
  onValueChange,
  placeholder,
  onPressOverride,
  triggerClassName,
  triggerTextClassName,
}: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const [buttonFrame, setButtonFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const hasValue = !!selectedValue;

  const selectedLabel = items.find((item) => item.value === selectedValue)?.label || placeholder;

  function openPicker() {
    if (onPressOverride) {
      onPressOverride();
      return;
    }

    buttonRef.current?.measure((_fx, _fy, width, height, px, py) => {
      setButtonFrame({ width, height, x: px, y: py });
    });
    setModalVisible(true);
  }

  function handleSelect(item: PickerItem) {
    onValueChange(item.value);
    setModalVisible(false);
  }

  return (
    <>
      <Pressable
        ref={buttonRef as any}
        onPress={openPicker}
        className={`
          flex-row items-center justify-between rounded-lg border border-black px-1 py-2
          ${hasValue ? 'bg-white' : 'bg-white'}
          ${triggerClassName ?? ''}
        `}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={`min-w-0 flex-1 text-left font-poetsenone text-base ${triggerTextClassName ?? ''}`}>
          {selectedLabel}
        </Text>
        <View className="w-5 items-end">
          <Ionicons name="chevron-down" size={20} color="black" />
        </View>
      </Pressable>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalView,
              {
                top: buttonFrame.y + buttonFrame.height + 8,
                left: buttonFrame.x,
                width: buttonFrame.width,
              },
            ]}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={Separador}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <AnimatedPickerOption
                  item={item}
                  isSelected={item.value === selectedValue}
                  onSelect={handleSelect}
                />
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  modalView: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 210,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  item: {
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  itemText: {
    fontSize: 16,
    color: tokens.colors.text.base,
    fontWeight: '700',
    textAlign: 'center',
  },
});
