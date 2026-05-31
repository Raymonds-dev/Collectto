import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

const MIN_YEAR = 1900;

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

const pad2 = (value: number): string => String(value).padStart(2, '0');

const getYearFromDate = (dateString?: string | null): number => {
  if (!dateString) {
    return new Date().getFullYear();
  }

  const year = parseInt(dateString.split('-')[0], 10);
  return Number.isNaN(year) ? new Date().getFullYear() : year;
};

const clampDayForMonth = (year: number, month: number, day: number): number => {
  const daysInMonth = new Date(year, month, 0).getDate();
  return Math.min(day, daysInMonth);
};

const updateDateYear = (dateString: string, year: number): string => {
  const [, m, d] = dateString.split('-');
  const month = parseInt(m, 10);
  const day = parseInt(d, 10);
  const safeDay = clampDayForMonth(year, month, day);
  return `${year}-${pad2(month)}-${pad2(safeDay)}`;
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
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState<string | null>(value ?? null);
  const [calendarMonth, setCalendarMonth] = useState<string | null>(value ?? null);
  const [yearDraft, setYearDraft] = useState<number>(getYearFromDate(value));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) => currentYear - index);
  }, []);

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
    setCalendarMonth(value ?? null);
    setIsCalendarVisible(false);
  };

  const handleYearConfirm = (): void => {
    const nextYear = yearDraft;
    const nextDraftDate = draftDate ? updateDateYear(draftDate, nextYear) : null;
    const baseMonth = nextDraftDate
      ? nextDraftDate
      : `${nextYear}-${pad2(new Date().getMonth() + 1)}-01`;

    setDraftDate(nextDraftDate);
    setCalendarMonth(baseMonth);
    setIsYearPickerVisible(false);
    setIsCalendarVisible(true);
  };

  const handleYearCancel = (): void => {
    setYearDraft(getYearFromDate(value));
    setIsYearPickerVisible(false);
  };

  const openCalendar = (): void => {
    setDraftDate(value ?? null);
    setCalendarMonth(value ?? null);
    setYearDraft(getYearFromDate(value));
    setIsYearPickerVisible(true);
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

      {/* Year Picker Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={isYearPickerVisible}
        onRequestClose={handleYearCancel}>
        <Pressable
          style={styles.overlay}
          onPress={handleYearCancel}
          accessibilityRole="button"
          accessibilityLabel="Fechar seletor de ano">
          <View style={styles.centeredContainer}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.yearHeader}>
                <Text style={styles.yearHeaderText}>Selecionar ano</Text>
              </View>

              <Picker
                selectedValue={yearDraft}
                onValueChange={(value) => setYearDraft(Number(value))}
                style={styles.yearPicker}
                itemStyle={styles.yearPickerItem}
                accessibilityLabel="Selecionar ano">
                {yearOptions.map((year) => (
                  <Picker.Item key={year} label={String(year)} value={year} />
                ))}
              </Picker>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={handleYearCancel}
                  style={styles.cancelButton}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar seleção de ano">
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <View style={styles.actionsSpacer} />
                <Pressable
                  onPress={handleYearConfirm}
                  style={styles.confirmButton}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar ano selecionado">
                  <Text style={styles.confirmText}>Continuar</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

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
                current={calendarMonth ?? draftDate ?? undefined}
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
                <View style={styles.actionsSpacer} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsSpacer: {
    flex: 1,
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
  yearHeader: {
    alignItems: 'center',
    backgroundColor: tokens.colors.neutral.black,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  yearHeaderText: {
    color: tokens.colors.neutral.white,
    fontFamily: 'PoetsenOne-Regular',
    fontSize: 18,
  },
  yearPicker: {
    backgroundColor: tokens.colors.surface.canvas,
    height: 180,
    width: '100%',
  },
  yearPickerItem: {
    color: tokens.colors.text.base,
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    backgroundColor: tokens.colors.overlay.scrim,
    flex: 1,
  },
});
