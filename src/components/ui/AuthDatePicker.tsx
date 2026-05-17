import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { tokens } from '@/styles/tailwind/tokens.native';
import '@/components/ui/calendarLocale';

interface AuthDatePickerProps {
  /** Label shown above the trigger. */
  label?: string;
  /** Current date value in ISO format (YYYY-MM-DD). */
  value?: string | null;
  /** Called when the user selects a date. */
  onDateChange: (dateString: string) => void;
  /** Validation error to display below the trigger. */
  error?: string | null;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Formats an ISO date string (YYYY-MM-DD) to a human-readable string.
 * Example: "2000-03-15" → "15 de Março de 2000"
 */
const formatDisplayDate = (dateString: string): string => {
  const [y, m, d] = dateString.split('-');
  const monthIndex = parseInt(m, 10) - 1;
  const monthName = MONTH_NAMES[monthIndex] ?? m;
  return `${parseInt(d, 10)} de ${monthName} de ${y}`;
};

/**
 * Auth-themed DatePicker.
 *
 * Matches the bold dark-input style of the registration flow in user_create.tsx.
 * Shows a single unified date field; tapping opens a branded calendar modal.
 *
 * Design decisions:
 * - Uses neutral.black background with white text to match auth inputs
 * - PoetsenOne font for consistency with the registration screen
 * - Brand primary (#FE5E00) for selected date highlight and confirm action
 * - Scrim overlay for modal backdrop
 */
export function AuthDatePicker({ label, value, onDateChange, error }: AuthDatePickerProps) {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<string | null>(value ?? null);

  const handleDayPress = (date: DateData): void => {
    setDraftDate(date.dateString);
  };

  const handleConfirm = (): void => {
    if (draftDate) {
      onDateChange(draftDate);
    }
    setIsCalendarVisible(false);
  };

  const handleCancel = (): void => {
    setDraftDate(value ?? null);
    setIsCalendarVisible(false);
  };

  const openCalendar = (): void => {
    setDraftDate(value ?? null);
    setIsCalendarVisible(true);
  };

  const displayText = value ? formatDisplayDate(value) : 'SELECIONAR DATA';
  const hasValue = Boolean(value);

  return (
    <View className="w-full">
      {label && <Text className="mb-4 font-poetsenone text-xl text-black">{label}</Text>}

      {/* Unified trigger — single tap target */}
      <Pressable
        onPress={openCalendar}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Selecionar data'}
        accessibilityHint="Toque para abrir o calendário"
        className="flex-row items-center justify-between rounded-xl bg-neutral-black px-4 py-4 active:opacity-80">
        <Text
          className={`flex-1 font-poetsenone text-xl ${hasValue ? 'text-neutral-white' : 'text-neutral-gray1'}`}>
          {displayText}
        </Text>
        {/* @expo/vector-icons não suporta NativeWind color; usar style */}
        <Ionicons
          name="calendar-outline"
          size={22}
          style={{ color: hasValue ? tokens.colors.brand.primary : tokens.colors.neutral.gray2 }}
        />
      </Pressable>

      {error && <Text className="mt-2 text-sm text-feedback-error">{error}</Text>}

      {/* Calendar Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isCalendarVisible}
        onRequestClose={handleCancel}>
        <Pressable
          style={styles.overlay}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Fechar calendário">
          <View style={styles.centeredContainer}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {draftDate ? formatDisplayDate(draftDate) : 'Selecione uma data'}
                </Text>
              </View>

              <Calendar
                current={draftDate ?? undefined}
                maxDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleDayPress}
                markedDates={
                  draftDate
                    ? {
                        [draftDate]: {
                          selected: true,
                          selectedColor: tokens.colors.brand.primary,
                        },
                      }
                    : undefined
                }
                theme={{
                  calendarBackground: tokens.colors.surface.canvas,
                  textSectionTitleColor: tokens.colors.text.subtle,
                  selectedDayBackgroundColor: tokens.colors.brand.primary,
                  selectedDayTextColor: tokens.colors.text.inverse,
                  todayTextColor: tokens.colors.brand[700],
                  todayBackgroundColor: tokens.colors.brand[50],
                  dayTextColor: tokens.colors.text.base,
                  textDisabledColor: tokens.colors.text.disabled,
                  monthTextColor: tokens.colors.text.base,
                  arrowColor: tokens.colors.brand.primary,
                  textMonthFontSize: 16,
                  textMonthFontWeight: '700',
                  textDayHeaderFontSize: 12,
                }}
              />

              {/* Actions */}
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar seleção de data">
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirm}
                  style={[styles.confirmButton, !draftDate && styles.confirmButtonDisabled]}
                  disabled={!draftDate}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar data selecionada">
                  <Text style={[styles.confirmText, !draftDate && styles.confirmTextDisabled]}>
                    Confirmar
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    borderTopColor: tokens.colors.surface.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelButton: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelText: {
    color: tokens.colors.text.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  centeredContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  confirmButtonDisabled: {
    backgroundColor: tokens.colors.surface.muted,
  },
  confirmText: {
    color: tokens.colors.text.inverse,
    fontSize: 15,
    fontWeight: '700',
  },
  confirmTextDisabled: {
    color: tokens.colors.text.disabled,
  },
  modalCard: {
    backgroundColor: tokens.colors.surface.canvas,
    borderRadius: 20,
    elevation: 8,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: tokens.colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    backgroundColor: tokens.colors.neutral.black,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalTitle: {
    color: tokens.colors.neutral.white,
    fontFamily: 'PoetsenOne-Regular',
    fontSize: 18,
  },
  overlay: {
    backgroundColor: tokens.colors.overlay.scrim,
    flex: 1,
  },
});
