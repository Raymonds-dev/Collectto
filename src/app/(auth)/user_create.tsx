import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Calendar, DateData } from 'react-native-calendars';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { CustomPicker } from '@/components/ui/custom_picker/custom_picker';

const styles = StyleSheet.create({
  input: {
    lineHeight: 20,
    minHeight: 56,
    paddingTop: Platform.OS === 'android' ? 12 : 14,
    paddingBottom: Platform.OS === 'android' ? 12 : 14,
    textAlignVertical: 'center',
  },
});

export default function UserCreateScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [day, setDay] = useState<string | undefined>();
  const [month, setMonth] = useState<string | undefined>();
  const [year, setYear] = useState<string | undefined>();
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarDraftYear, setCalendarDraftYear] = useState<string | null>(null);
  const [calendarDraftMonth, setCalendarDraftMonth] = useState<string | null>(null);
  const [calendarDraftDay, setCalendarDraftDay] = useState<string | null>(null);

  const defaultDate = new Date();
  const defaultMonth = String(defaultDate.getMonth() + 1).padStart(2, '0');
  const defaultYear = String(defaultDate.getFullYear());

  const [calendarMonthValue, setCalendarMonthValue] = useState<string>(defaultMonth);
  const [calendarYearValue, setCalendarYearValue] = useState<string>(defaultYear);
  const [calendarCurrent, setCalendarCurrent] = useState<string>(
    `${defaultYear}-${defaultMonth}-01`
  );

  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const dayItems = Array.from({ length: 31 }, (_, i) => {
    const dayValue = String(i + 1).padStart(2, '0');

    return {
      label: dayValue,
      value: dayValue,
    };
  });
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

  const parseDateParts = (dateString: string): { year: string; month: string; day: string } => {
    const [selectedYear, selectedMonth, selectedDay] = dateString.split('-');

    return {
      year: selectedYear,
      month: selectedMonth,
      day: selectedDay,
    };
  };

  const applyDateToFields = (dateString: string): void => {
    const parts = parseDateParts(dateString);

    setYear(parts.year);
    setMonth(parts.month);
    setDay(parts.day);
    setSelectedDate(dateString);
    setCalendarYearValue(parts.year);
    setCalendarMonthValue(parts.month);
    setCalendarCurrent(`${parts.year}-${parts.month}-01`);
  };

  const handleCalendarDayPress = (date: DateData): void => {
    const parts = parseDateParts(date.dateString);

    setCalendarDraftYear(parts.year);
    setCalendarDraftMonth(parts.month);
    setCalendarDraftDay(parts.day);
    setCalendarYearValue(parts.year);
    setCalendarMonthValue(parts.month);
    setCalendarCurrent(`${parts.year}-${parts.month}-01`);
  };

  const openCalendar = (): void => {
    const initialDate =
      selectedDate ?? `${year ?? calendarYearValue}-${month ?? calendarMonthValue}-01`;
    const parts = parseDateParts(initialDate);

    setCalendarDraftYear(year ?? parts.year);
    setCalendarDraftMonth(month ?? parts.month);
    setCalendarDraftDay(day ?? parts.day);
    setCalendarYearValue(parts.year);
    setCalendarMonthValue(parts.month);
    setCalendarCurrent(`${parts.year}-${parts.month}-01`);
    setIsCalendarVisible(true);
  };

  const handleCalendarMonthChange = (selectedMonthValue: string): void => {
    setCalendarDraftMonth(selectedMonthValue);
    setCalendarMonthValue(selectedMonthValue);
    setCalendarCurrent(`${calendarYearValue}-${selectedMonthValue}-01`);
  };

  const handleCalendarYearChange = (selectedYearValue: string): void => {
    setCalendarDraftYear(selectedYearValue);
    setCalendarYearValue(selectedYearValue);
    setCalendarCurrent(`${selectedYearValue}-${calendarMonthValue}-01`);
  };

  const closeCalendar = (): void => {
    if (calendarDraftYear && calendarDraftMonth && calendarDraftDay) {
      const draftDate = `${calendarDraftYear}-${calendarDraftMonth}-${calendarDraftDay}`;
      applyDateToFields(draftDate);
    } else if (selectedDate) {
      applyDateToFields(selectedDate);
    }

    setIsCalendarVisible(false);
  };

  const handleUserCreate = async (): Promise<void> => {
    setError(null);

    if (step === 1) {
      if (!name || !email) {
        setError('Por favor, preencha seu nome e email.');
        return;
      }
      if (!day || !month || !year) {
        setError('Selecione sua data de nascimento completa.');
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!username || !password) {
        setError('Por favor, preencha seu nome de usuário e senha.');
        return;
      }
      if (!termsAccepted) {
        setError('Você precisa aceitar os termos para continuar.');
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        await signUp({ name, username, email, password, birthdayDate: `${year}-${month}-${day}` });

        router.replace('/(auth)/login');
      } catch (registerError) {
        const message =
          registerError instanceof Error ? registerError.message : 'Falha ao cadastrar.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      enableAutomaticScroll
      extraHeight={Platform.OS === 'android' ? 24 : 0}
      extraScrollHeight={Platform.OS === 'ios' ? 24 : 48}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View className="items-center px-6 pb-8 pt-10">
        <View className="mb-4 items-center font-poetsenone">
          <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
          <Text className="mt-8 font-poetsenone text-4xl text-black">Crie sua conta</Text>
        </View>

        {step === 1 && (
          <>
            <View className="w-full max-w-md rounded-2xl p-5 ">
              <TextInput
                autoCapitalize="words"
                className="mt-15 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setName}
                placeholder="NOME"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={name}
              />

              <TextInput
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setEmail}
                placeholder="EMAIL"
                placeholderTextColor="#D9D9D9"
                secureTextEntry
                style={styles.input}
                value={email}
                keyboardType="email-address"
              />

              {error ? (
                <Text className="mt-3 text-center text-sm text-red-600">{error}</Text>
              ) : null}

              <View className="mt-8 w-full">
                <Text className="mb-4 font-poetsenone text-xl text-black">DATA DE NASCIMENTO</Text>
                <View className="flex-row gap-5">
                  <View className="">
                    <CustomPicker
                      placeholder="Dia"
                      items={dayItems}
                      selectedValue={day}
                      onValueChange={setDay}
                      onPressOverride={openCalendar}
                      triggerClassName="w-18 rounded-xl border-2 border-black px-2 py-3"
                      triggerTextClassName="text-xl text-black"
                    />
                  </View>
                  <View className="">
                    <CustomPicker
                      placeholder="Mês"
                      items={monthItems}
                      selectedValue={month}
                      onValueChange={setMonth}
                      onPressOverride={openCalendar}
                      triggerClassName="w-36 rounded-xl border-2 border-black px-2 py-3"
                      triggerTextClassName="text-xl text-black"
                    />
                  </View>
                  <View className="">
                    <CustomPicker
                      placeholder="Ano"
                      items={yearItems}
                      selectedValue={year}
                      onValueChange={setYear}
                      onPressOverride={openCalendar}
                      triggerClassName="w-26 rounded-xl border-2 border-black px-2 py-3"
                      triggerTextClassName="text-xl text-black"
                    />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View className="w-full max-w-md rounded-2xl p-6 ">
              <TextInput
                autoCapitalize="none"
                className="rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setUsername}
                placeholder="NOME DE USUARIO"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={username}
              />
              <TextInput
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setPassword}
                placeholder="SENHA"
                placeholderTextColor="#D9D9D9"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              <TextInput
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setConfirmPassword}
                placeholder="CONFIRME SUA SENHA"
                placeholderTextColor="#D9D9D9"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
              />
            </View>
            {error ? <Text className="mb-2 text-center text-sm text-red-600">{error}</Text> : null}
            <View className="ml-6 mt-6 flex-row items-center">
              <Checkbox
                value={termsAccepted}
                onValueChange={setTermsAccepted}
                color={termsAccepted ? '#FF9500' : undefined}
                className="mr-3"
              />
              <Text className="flex-1 text-sm text-black">
                Li e aceito os <Text className="font-bold">Termos de Uso</Text> e a{' '}
                <Text className="font-bold">Política de Privacidade</Text>
              </Text>
            </View>
          </>
        )}

        <View className="items-center">
          <Pressable
            className="mb-6 mt-10 w-full items-center rounded-xl bg-orange-500 px-5 py-4 active:bg-black"
            disabled={isSubmitting}
            onPress={handleUserCreate}>
            <Text className="font-poetsenone text-2xl text-white">
              {step === 1 ? 'Avançar' : 'Cadastrar'}
            </Text>
          </Pressable>
        </View>
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
                  onValueChange={handleCalendarMonthChange}
                />
              </View>
              <View className="ml-2 flex-1">
                <CustomPicker
                  placeholder="Ano"
                  items={yearItems}
                  selectedValue={calendarYearValue}
                  onValueChange={handleCalendarYearChange}
                />
              </View>
            </View>

            <Calendar
              key={`${calendarYearValue}-${calendarMonthValue}`}
              current={calendarCurrent}
              maxDate={new Date().toISOString().split('T')[0]}
              onDayPress={handleCalendarDayPress}
              onMonthChange={(date) => {
                const nextMonth = String(date.month).padStart(2, '0');
                const nextYear = String(date.year);

                setCalendarMonthValue(nextMonth);
                setCalendarYearValue(nextYear);
                setCalendarCurrent(`${nextYear}-${nextMonth}-01`);
              }}
              markedDates={
                calendarDraftYear && calendarDraftMonth && calendarDraftDay
                  ? {
                      [`${calendarDraftYear}-${calendarDraftMonth}-${calendarDraftDay}`]: {
                        selected: true,
                        selectedColor: '#FF9500',
                      },
                    }
                  : selectedDate
                    ? {
                        [selectedDate]: {
                          selected: true,
                          selectedColor: '#FF9500',
                        },
                      }
                    : undefined
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
    </KeyboardAwareScrollView>
  );
}
