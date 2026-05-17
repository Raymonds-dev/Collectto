import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { tokens } from '@/styles/tailwind/tokens.native';
import '@/components/ui/calendarLocale';

interface DatePickerProps {
  /** Label shown above the trigger. */
  label?: string;
  /** Current date value in ISO format (YYYY-MM-DD). */
  value?: string | null;
  /** Called when the user selects a date. */
  onDateChange: (dateString: string) => void;
  /** Validation error to display below the trigger. */
  error?: string | null;
  /** Placeholder text when no date is selected. */
  placeholder?: string;
}

const MONTH_NAMES_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

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
 * Formats a date for compact display on the trigger.
 * Example: "2023-06-15" → "15 Jun 2023"
 */
const formatShortDate = (dateString: string): string => {
  const [y, m, d] = dateString.split('-');
  const monthIndex = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${MONTH_NAMES_SHORT[monthIndex] ?? m} ${y}`;
};

/**
 * Formats a date for the modal header display.
 * Example: "2023-06-15" → "15 de Junho de 2023"
 */
const formatFullDate = (dateString: string): string => {
  const [y, m, d] = dateString.split('-');
  const monthIndex = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} de ${MONTH_NAMES[monthIndex] ?? m} de ${y}`;
};

/**
 * Modern form DatePicker for item/collection creation flows.
 *
 * Design decisions:
 * - Single unified field with a calendar icon for clear affordance
 * - Compact date format on the trigger, full format in the modal header
 * - brand-500 accent for selection and confirmation
 * - surface tokens for backgrounds and borders to stay consistent with the form style
 * - info/infoSoft for the selected-date chip in the modal header for differentiation
 * - Confirm/Cancel pattern with disabled-state handling
 * - Full accessibility labels and roles
 */
export function DatePicker({
  label,
  value,
  onDateChange,
  error,
  placeholder = 'Selecionar data',
}: DatePickerProps) {
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

  const handleClear = (): void => {
    setDraftDate(null);
    onDateChange('');
    setIsCalendarVisible(false);
  };

  const openCalendar = (): void => {
    setDraftDate(value ?? null);
    setIsCalendarVisible(true);
  };

  const hasValue = Boolean(value);
  const hasError = Boolean(error);

  return (
    <View className="w-full">
      {label && (
        <Text
          className={`mb-2 text-sm font-semibold ${hasError ? 'text-feedback-error' : 'text-text-muted'}`}
          accessibilityRole="header">
          {label}
        </Text>
      )}

      {/* Unified trigger — modern pill-style */}
      <Pressable
        onPress={openCalendar}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Selecionar data'}
        accessibilityHint="Toque para abrir o calendário"
        style={[
          styles.trigger,
          hasError && styles.triggerError,
          hasValue && styles.triggerSelected,
        ]}>
        {/* @expo/vector-icons não suporta NativeWind color; usar style */}
        <Ionicons
          name="calendar-outline"
          size={20}
          style={{
            color: hasError
              ? tokens.colors.feedback.error
              : hasValue
                ? tokens.colors.brand.primary
                : tokens.colors.text.subtle,
          }}
        />
        <Text
          style={[
            styles.triggerText,
            hasValue && styles.triggerTextSelected,
            hasError && styles.triggerTextError,
          ]}>
          {hasValue ? formatShortDate(value!) : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          style={{
            color: hasValue ? tokens.colors.brand.primary : tokens.colors.text.disabled,
          }}
        />
      </Pressable>

      {error && <Text className="mt-1 text-xs text-feedback-error">{error}</Text>}

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
              {/* Modal header with selected date chip */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalLabel}>{label ?? 'Selecionar data'}</Text>
                {draftDate && (
                  <View style={styles.dateChip}>
                    <Ionicons
                      name="calendar"
                      size={14}
                      style={{ color: tokens.colors.feedback.info }}
                    />
                    <Text style={styles.dateChipText}>{formatFullDate(draftDate)}</Text>
                  </View>
                )}
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
                  textMonthFontSize: 15,
                  textMonthFontWeight: '600',
                  textDayHeaderFontSize: 12,
                  textDayFontSize: 14,
                  textDayFontWeight: '500',
                }}
              />

              {/* Actions row */}
              <View style={styles.actionsRow}>
                {hasValue && (
                  <Pressable
                    onPress={handleClear}
                    style={styles.clearButton}
                    accessibilityRole="button"
                    accessibilityLabel="Limpar data selecionada">
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      style={{ color: tokens.colors.feedback.error }}
                    />
                    <Text style={styles.clearText}>Limpar</Text>
                  </Pressable>
                )}
                <View style={styles.actionsSpacer} />
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
    alignItems: 'center',
    borderTopColor: tokens.colors.surface.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsSpacer: {
    flex: 1,
  },
  cancelButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    color: tokens.colors.text.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  centeredContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  clearButton: {
    alignItems: 'center',
    borderColor: tokens.colors.feedback.errorSoft,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearText: {
    color: tokens.colors.feedback.error,
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 14,
    fontWeight: '700',
  },
  confirmTextDisabled: {
    color: tokens.colors.text.disabled,
  },
  dateChip: {
    alignItems: 'center',
    backgroundColor: tokens.colors.feedback.infoSoft,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateChipText: {
    color: tokens.colors.feedback.info,
    fontSize: 13,
    fontWeight: '600',
  },
  modalCard: {
    backgroundColor: tokens.colors.surface.canvas,
    borderRadius: 20,
    elevation: 8,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: tokens.colors.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: tokens.colors.surface.border,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalLabel: {
    color: tokens.colors.text.base,
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    backgroundColor: tokens.colors.overlay.scrim,
    flex: 1,
  },
  trigger: {
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.base,
    borderColor: tokens.colors.surface.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  triggerError: {
    backgroundColor: tokens.colors.feedback.errorSoft,
    borderColor: tokens.colors.feedback.error,
  },
  triggerSelected: {
    borderColor: tokens.colors.brand[200],
  },
  triggerText: {
    color: tokens.colors.text.subtle,
    flex: 1,
    fontSize: 15,
  },
  triggerTextError: {
    color: tokens.colors.feedback.error,
  },
  triggerTextSelected: {
    color: tokens.colors.text.base,
    fontWeight: '500',
  },
});
