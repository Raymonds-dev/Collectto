import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [calendarMonthDate, setCalendarMonthDate] = useState<Date>(
    value ? parseDateString(value) : new Date()
  );
  const [calendarKey, setCalendarKey] = useState(0);

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
    setIsYearPickerVisible((prev) => !prev);
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

              {isYearPickerVisible ? (
                <View style={{ height: 350, paddingHorizontal: 16 }}>
                  {/* Header inside the picker to return */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: tokens.colors.surface.border,
                    }}>
                    <Text
                      style={{
                        color: tokens.colors.text.base,
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                      Selecionar Ano
                    </Text>
                    <Pressable
                      onPress={() => setIsYearPickerVisible(false)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: tokens.colors.brand[50],
                      }}>
                      <Text
                        style={{
                          color: tokens.colors.brand.primary,
                          fontSize: 12,
                          fontWeight: '600',
                        }}>
                        Voltar
                      </Text>
                    </Pressable>
                  </View>

                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        paddingVertical: 8,
                        gap: 8,
                      }}>
                      {yearOptions.map((year) => {
                        const isSelected = calendarMonthDate.getFullYear() === year;
                        return (
                          <Pressable
                            key={year}
                            style={[
                              {
                                width: '31%',
                                marginHorizontal: '1%',
                                marginVertical: 6,
                                paddingVertical: 8,
                                alignItems: 'center',
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: tokens.colors.surface.border,
                                backgroundColor: tokens.colors.surface.canvas,
                              },
                              isSelected && {
                                backgroundColor: tokens.colors.brand.primary,
                                borderColor: tokens.colors.brand.primary,
                              },
                            ]}
                            onPress={() => {
                              handleYearChange(year);
                              setIsYearPickerVisible(false);
                            }}>
                            <Text
                              style={[
                                {
                                  fontSize: 14,
                                  color: tokens.colors.text.base,
                                  fontWeight: '500',
                                },
                                isSelected && {
                                  color: tokens.colors.text.inverse,
                                  fontWeight: '700',
                                },
                              ]}>
                              {year}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ) : (
                <>
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
                        <View style={styles.calendarHeaderRow}>
                          <Text style={styles.calendarHeaderMonth}>{monthLabel}</Text>
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
                              name="chevron-down"
                              size={14}
                              style={styles.calendarHeaderYearIcon}
                            />
                          </Pressable>
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
                </>
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
  calendarHeaderMonth: {
    color: tokens.colors.text.base,
    fontSize: 16,
    fontWeight: '700',
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
  calendarHeaderYearText: {
    color: tokens.colors.text.base,
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
