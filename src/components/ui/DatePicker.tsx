import React, { useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const MIN_YEAR = 1900;

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

const pad2 = (value: number): string => String(value).padStart(2, '0');

const parseDateString = (dateString: string): Date => {
  const [y, m, d] = dateString.split('-').map((part) => parseInt(part, 10));
  if (!y || !m || !d) {
    return new Date();
  }
  return new Date(y, m - 1, d);
};

const formatDateForCalendar = (date: Date): string => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
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
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [draftDate, setDraftDate] = useState<string | null>(value ?? null);
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(
    value ? parseDateString(value) : new Date()
  );

  const yearButtonRef = useRef<View>(null);
  const modalCardRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

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
    setIsYearPickerVisible(false);
    setIsCalendarVisible(false);
  };

  const handleClear = (): void => {
    setDraftDate(null);
    onDateChange('');
    setIsCalendarVisible(false);
  };

  const openCalendar = (): void => {
    setDraftDate(value ?? null);
    setCalendarMonthDate(value ? parseDateString(value) : new Date());
    setIsYearPickerVisible(false);
    setIsCalendarVisible(true);
  };

  const handleYearChange = (nextYear: number): void => {
    setCalendarMonthDate(new Date(nextYear, calendarMonthDate.getMonth(), 1));
    setCalendarKey((prev) => prev + 1);
    if (draftDate) {
      setDraftDate(updateDateYear(draftDate, nextYear));
    }
  };

  const toggleYearPicker = (): void => {
    if (!isYearPickerVisible) {
      if (yearButtonRef.current && modalCardRef.current) {
        modalCardRef.current.measure(
          (modalX, modalY, modalWidth, modalHeight, modalPageX, modalPageY) => {
            yearButtonRef.current?.measure(
              (btnX, btnY, btnWidth, btnHeight, btnPageX, btnPageY) => {
                setDropdownPosition({
                  top: btnPageY - modalPageY + btnHeight + 4,
                  left: btnPageX - modalPageX,
                  width: btnWidth,
                });
                setIsYearPickerVisible(true);
              }
            );
          }
        );
      } else {
        setIsYearPickerVisible(true);
      }
    } else {
      setIsYearPickerVisible(false);
    }
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
            <Pressable ref={modalCardRef} style={styles.modalCard} onPress={() => {}}>
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
                key={calendarKey}
                current={formatDateForCalendar(calendarMonthDate)}
                maxDate={new Date().toISOString().split('T')[0]}
                onDayPress={handleDayPress}
                onMonthChange={(date) => {
                  setCalendarMonthDate(new Date(date.year, date.month - 1, 1));
                }}
                renderHeader={(date) => {
                  const monthLabel = MONTH_NAMES[date.getMonth()] ?? '';
                  const headerYear = date.getFullYear();
                  return (
                    <View style={[styles.calendarHeaderRow, { zIndex: 999, elevation: 999 }]}>
                      <Text style={styles.calendarHeaderMonth}>{monthLabel}</Text>
                      <View
                        ref={yearButtonRef}
                        style={{ position: 'relative', zIndex: 999, elevation: 999 }}>
                        <Pressable
                          onPress={toggleYearPicker}
                          style={[
                            styles.calendarHeaderYearButton,
                            isYearPickerVisible && styles.calendarHeaderYearButtonActive,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Selecionar ano">
                          <Text style={styles.calendarHeaderYearText}>{headerYear}</Text>
                          <Ionicons
                            name={isYearPickerVisible ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            style={styles.calendarHeaderYearIcon}
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                }}
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
                  stylesheet: {
                    calendar: {
                      header: {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingLeft: 10,
                        paddingRight: 10,
                        marginTop: 6,
                        alignItems: 'center',
                        zIndex: 9999,
                        elevation: 9999,
                      },
                    },
                  },
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

              {isYearPickerVisible && dropdownPosition && (
                <View
                  style={[
                    styles.absoluteYearPicker,
                    {
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                    },
                  ]}>
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={false}
                    style={styles.yearPickerScroll}>
                    {yearOptions.map((year) => {
                      const isSelected = calendarMonthDate.getFullYear() === year;
                      return (
                        <Pressable
                          key={year}
                          style={[
                            styles.yearPickerItem,
                            isSelected && styles.yearPickerItemSelected,
                          ]}
                          onPress={() => {
                            handleYearChange(year);
                            setIsYearPickerVisible(false);
                          }}>
                          <Text
                            style={[
                              styles.yearPickerItemText,
                              isSelected && styles.yearPickerItemTextSelected,
                            ]}>
                            {year}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
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
  confirmButton: {
    backgroundColor: tokens.colors.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
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
  calendarHeaderMonth: {
    color: tokens.colors.text.base,
    fontSize: 15,
    fontWeight: '600',
  },
  calendarHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  calendarHeaderYearButton: {
    alignItems: 'center',
    borderColor: tokens.colors.surface.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  calendarHeaderYearIcon: {
    color: tokens.colors.text.muted,
  },
  calendarHeaderYearButtonActive: {
    borderColor: tokens.colors.brand.primary,
    backgroundColor: tokens.colors.brand[50],
  },
  absoluteYearPicker: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: tokens.colors.surface.canvas,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.surface.border,
    shadowColor: tokens.colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 9999,
    zIndex: 9999,
    overflow: 'hidden',
  },
  yearPickerScroll: {
    maxHeight: 240,
  },
  yearPickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearPickerItemSelected: {
    backgroundColor: tokens.colors.brand[50],
  },
  yearPickerItemText: {
    fontSize: 14,
    color: tokens.colors.text.base,
    fontWeight: '500',
  },
  yearPickerItemTextSelected: {
    color: tokens.colors.brand.primary,
    fontWeight: '700',
  },
  calendarHeaderYearText: {
    color: tokens.colors.text.base,
    fontSize: 13,
    fontWeight: '600',
  },
  dateChip: {
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
    overflow: 'visible',
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
