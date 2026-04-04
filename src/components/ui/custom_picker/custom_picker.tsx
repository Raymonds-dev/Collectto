import React, { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usaremos um ícone de seta

// Tipos para as propriedades do nosso componente
interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  items: PickerItem[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  placeholder: string;
}

const Separador = () => <View style={{ height: 10 }}></View>;

export function CustomPicker({
  items,
  selectedValue,
  onValueChange,
  placeholder,
}: CustomPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef<View>(null);
  const [buttonFrame, setButtonFrame] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const hasValue = !!selectedValue;

  const selectedLabel = items.find((item) => item.value === selectedValue)?.label || placeholder;

  function openPicker() {
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
      {/* 1. O "Botão Falso" que fica visível na tela */}
      <Pressable
        ref={buttonRef as any}
        onPress={openPicker}
        className={`
          flex-row items-center justify-between rounded-lg border border-black px-3 py-2
          ${hasValue ? 'bg-orange-500' : 'bg-white'} 
        `}>
        <Text className="font-poetsenone text-base">{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color={hasValue ? 'black' : 'black'} />
      </Pressable>

      {/* 2. O Modal que abre com as opções */}
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
                top: buttonFrame.y + buttonFrame.height - 10,
                left: buttonFrame.x,
                width: buttonFrame.width,
              },
            ]}>
            {/* 3. A lista rolável de opções */}
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              ItemSeparatorComponent={Separador}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed, // Aplica o estilo 'itemPressed' quando pressionado
                  ]}
                  onPress={() => handleSelect(item)}>
                  {({ pressed }) => (
                    <Text style={[styles.itemText, pressed && { color: 'black' }]}>
                      {item.label}
                    </Text>
                  )}
                </Pressable>
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
    position: 'absolute', // Essencial para o posicionamento
    backgroundColor: 'black',
    borderRadius: 10,
    borderTopLeftRadius: 10, // Opcional: para "grudar" no botão
    borderTopRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 220, // Altura máxima antes de começar a rolar
  },
  item: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  itemPressed: {
    backgroundColor: '#FF9500',
  },
  itemText: {
    fontSize: 16,
    color: '#FF9500',
    textAlign: 'center',
  },
});
