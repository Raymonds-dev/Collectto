import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { AuthDatePicker } from '@/components/ui/AuthDatePicker';
import {
  validateBirthday,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validation';

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

  const [date, setDate] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleUserCreate = async (): Promise<void> => {
    setError(null);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (step === 1) {
      if (!normalizedName || !normalizedEmail) {
        setError('Por favor, preencha seu nome e email.');
        return;
      }

      const [emailIsValid, emailErrorMessage] = validateEmail(normalizedEmail);
      if (!emailIsValid) {
        setError(emailErrorMessage);
        return;
      }

      if (!date) {
        setError('Selecione sua data de nascimento completa.');
        return;
      }

      const [birthdayIsValid, birthdayErrorMessage] = validateBirthday(date);
      if (!birthdayIsValid) {
        setError(birthdayErrorMessage);
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const birthdayDate = date;

      const [usernameIsValid, usernameErrorMessage] = validateUsername(normalizedUsername);
      if (!usernameIsValid) {
        setError(usernameErrorMessage);
        return;
      }

      const [passwordIsValid, passwordErrorMessage] = validatePassword(password);
      if (!passwordIsValid) {
        setError(passwordErrorMessage);
        return;
      }

      if (!birthdayDate) {
        setError('Selecione sua data de nascimento completa.');
        return;
      }

      const [birthdayIsValid, birthdayErrorMessage] = validateBirthday(birthdayDate);
      if (!birthdayIsValid) {
        setError(birthdayErrorMessage);
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não conferem.');
        return;
      }

      if (!termsAccepted) {
        setError('Você precisa aceitar os termos para continuar.');
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        await signUp({
          name: normalizedName,
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          birthdayDate,
        });

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
                autoCapitalize="none"
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={setEmail}
                placeholder="EMAIL"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={email}
                keyboardType="email-address"
              />

              {error ? (
                <Text className="mt-3 text-center text-sm text-red-600">{error}</Text>
              ) : null}

              <View className="mt-8 w-full">
                <AuthDatePicker label="DATA DE NASCIMENTO" value={date} onDateChange={setDate} />
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
    </KeyboardAwareScrollView>
  );
}
