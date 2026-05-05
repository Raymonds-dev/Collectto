import { CustomPicker } from '@/components/ui/custom_picker/custom_picker';
import { useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { Modal, Pressable, Text, View } from 'react-native';

interface DatePickerProps {
  initialDate?: string;
  onDateChange: (date: string) => void;
}

export const DatePicker = ({ initialDate, onDateChange }: DatePickerProps) => {
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate || null);
  const [draftDate, setDraftDate] = useState<string | null>(initialDate || null);

  const [day, setDay] = useState<string | undefined>(
    initialDate ? initialDate.split('-')[2] : undefined
  );
  const [month, setMonth] = useState<string | undefined>(
    initialDate ? initialDate.split('-')[1] : undefined
  );
  const [year, setYear] = useState<string | undefined>(
    initialDate ? initialDate.split('-')[0] : undefined
  );

  const defaultDate = new Date(initialDate || Date.now());
  const [calendarMonthValue, setCalendarMonthValue] = useState<string>(
    String(defaultDate.getMonth() + 1).padStart(2, '0')
  );
  const [calendarYearValue, setCalendarYearValue] = useState<string>(
    String(defaultDate.getFullYear())
  );
  const [calendarCurrent, setCalendarCurrent] = useState<string>(
    `${calendarYearValue}-${calendarMonthValue}-01`
  );

  const dayItems = Array.from({ length: 31 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: String(i + 1).padStart(2, '0'),
  }));
  const monthItems = [
    { label: 'Janeiro', value: '01' },
    { label: 'Fevereiro', value: '02' },
    { label: 'Março', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Maio', value: '05' },
    { label: 'Junho', value: '06' },
    { label: 'Julho', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Setembro', value: '09' },
    { label: 'Outubro', value: '10' },
    { label: 'Novembro', value: '11' },
    { label: 'Dezembro', value: '12' },
  ];
  const yearItems = Array.from({ length: 105 }, (_, i) => ({
    label: `${new Date().getFullYear() - i}`,
    value: `${new Date().getFullYear() - i}`,
  }));

  const parseDateParts = (dateString: string) => {
    const [y, m, d] = dateString.split('-');
    return { year: y, month: m, day: d };
  };

  const openCalendar = () => {
    const dateToOpen = selectedDate || new Date().toISOString().split('T')[0];
    const parts = parseDateParts(dateToOpen);
    setCalendarYearValue(parts.year);
    setCalendarMonthValue(parts.month);
    setCalendarCurrent(`${parts.year}-${parts.month}-01`);
    setDraftDate(dateToOpen);
    setIsCalendarVisible(true);
  };

  const handleDayPress = (date: DateData) => {
    setDraftDate(date.dateString);
  };

  const closeCalendar = () => {
    if (draftDate) {
      setSelectedDate(draftDate);
      onDateChange(draftDate);
      const parts = parseDateParts(draftDate);
      setDay(parts.day);
      setMonth(parts.month);
      setYear(parts.year);
    }
    setIsCalendarVisible(false);
  };

  return (
    <>
      <View className="flex-row gap-2">
        <CustomPicker
          placeholder="Dia"
          items={dayItems}
          selectedValue={day}
          onValueChange={(d) => {
            if (d) setDay(d);
          }}
          onPressOverride={openCalendar}
          triggerClassName="w-20 rounded-lg border border-surface-border bg-surface-card px-2 py-3"
          triggerTextClassName="text-base text-text-base"
        />
        <CustomPicker
          placeholder="Mês"
          items={monthItems}
          selectedValue={month}
          onValueChange={(m) => {
            if (m) setMonth(m);
          }}
          onPressOverride={openCalendar}
          triggerClassName="flex-1 rounded-lg border border-surface-border bg-surface-card px-2 py-3"
          triggerTextClassName="text-base text-text-base"
        />
        <CustomPicker
          placeholder="Ano"
          items={yearItems}
          selectedValue={year}
          onValueChange={(y) => {
            if (y) setYear(y);
          }}
          onPressOverride={openCalendar}
          triggerClassName="w-28 rounded-lg border border-surface-border bg-surface-card px-2 py-3"
          triggerTextClassName="text-base text-text-base"
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isCalendarVisible}
        onRequestClose={closeCalendar}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-md rounded-2xl bg-white p-4">
            <View className="mb-3 flex-row">
              <View className="mr-2 flex-1">
                <CustomPicker
                  placeholder="Mês"
                  items={monthItems}
                  selectedValue={calendarMonthValue}
                  onValueChange={(m) => {
                    if (m) {
                      setCalendarMonthValue(m);
                      setCalendarCurrent(`${calendarYearValue}-${m}-01`);
                    }
                  }}
                />
              </View>
              <View className="ml-2 flex-1">
                <CustomPicker
                  placeholder="Ano"
                  items={yearItems}
                  selectedValue={calendarYearValue}
                  onValueChange={(y) => {
                    if (y) {
                      setCalendarYearValue(y);
                      setCalendarCurrent(`${y}-${calendarMonthValue}-01`);
                    }
                  }}
                />
              </View>
            </View>

            <Calendar
              key={calendarCurrent}
              current={calendarCurrent}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleDayPress}
              markedDates={
                draftDate ? { [draftDate]: { selected: true, selectedColor: '#FF9500' } } : {}
              }
              theme={{
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#6B7280',
                selectedDayBackgroundColor: '#FF9500',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#111827',
                dayTextColor: '#111827',
                monthTextColor: '#111827',
                arrowColor: '#111827',
                textMonthFontSize: 16,
                textMonthFontWeight: '700',
                textDayHeaderFontSize: 12,
              }}
            />

            <View className="mt-3 flex-row justify-end">
              <Pressable
                className="rounded-lg px-4 py-2"
                onPress={closeCalendar}
                accessibilityRole="button"
                accessibilityLabel="Fechar calendário e aplicar data">
                <Text className="font-poetsenone text-xl text-black">Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
