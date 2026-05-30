import { useAuth } from '@/hooks/useAuth';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { AuthDatePicker } from '@/components/ui/AuthDatePicker';
import {
  validateBirthday,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validation';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { MappedError } from '@/types/error';

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

  const [error, setError] = useState<MappedError | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  // Clear name error when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    if (error) setError(null);
  };

  // Clear email error on change
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) {
      if (error.fieldErrors?.email) {
        const updatedFields = { ...error.fieldErrors };
        delete updatedFields.email;
        setError({
          ...error,
          fieldErrors: Object.keys(updatedFields).length > 0 ? updatedFields : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  // Clear username error on change
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (error) {
      if (error.fieldErrors?.username) {
        const updatedFields = { ...error.fieldErrors };
        delete updatedFields.username;
        setError({
          ...error,
          fieldErrors: Object.keys(updatedFields).length > 0 ? updatedFields : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  // Clear password error on change
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) {
      if (error.fieldErrors?.password) {
        const updatedFields = { ...error.fieldErrors };
        delete updatedFields.password;
        setError({
          ...error,
          fieldErrors: Object.keys(updatedFields).length > 0 ? updatedFields : undefined,
        });
      } else {
        setError(null);
      }
    }
  };

  // Clear confirm password / validation error on change
  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (error) setError(null);
  };

  const handleUserCreate = async (): Promise<void> => {
    setError(null);

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (step === 1) {
      if (!normalizedName || !normalizedEmail) {
        setError({
          message: 'Por favor, preencha seu nome e email.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_REQUIRED_FIELDS',
        });
        return;
      }

      const [emailIsValid, emailErrorMessage] = validateEmail(normalizedEmail);
      if (!emailIsValid) {
        setError({
          message: emailErrorMessage || 'Formato de e-mail inválido.',
          category: 'VALIDATION',
          fieldErrors: { email: 'Insira um email válido (exemplo: voce@dominio.com)' },
          retryable: false,
          code: 'VALIDATION_EMAIL_INVALID',
        });
        return;
      }

      if (!date) {
        setError({
          message: 'Selecione sua data de nascimento completa.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_REQUIRED_FIELDS',
        });
        return;
      }

      const [birthdayIsValid, birthdayErrorMessage] = validateBirthday(date);
      if (!birthdayIsValid) {
        setError({
          message: birthdayErrorMessage || 'Você precisa ter pelo menos 13 anos para se cadastrar.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_AGE_LIMIT',
        });
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const birthdayDate = date;

      const [usernameIsValid, usernameErrorMessage] = validateUsername(normalizedUsername);
      if (!usernameIsValid) {
        setError({
          message: usernameErrorMessage || 'Nome de usuário inválido.',
          category: 'VALIDATION',
          fieldErrors: { username: usernameErrorMessage || 'Nome de usuário inválido.' },
          retryable: false,
          code: 'VALIDATION_USERNAME_INVALID',
        });
        return;
      }

      const [passwordIsValid, passwordErrorMessage] = validatePassword(password);
      if (!passwordIsValid) {
        setError({
          message: passwordErrorMessage || 'A senha deve ter pelo menos 8 caracteres.',
          category: 'VALIDATION',
          fieldErrors: {
            password: passwordErrorMessage || 'A senha deve ter pelo menos 8 caracteres.',
          },
          retryable: false,
          code: 'VALIDATION_PASSWORD_INVALID',
        });
        return;
      }

      if (!birthdayDate) {
        setError({
          message: 'Selecione sua data de nascimento completa.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_REQUIRED_FIELDS',
        });
        return;
      }

      if (password !== confirmPassword) {
        setError({
          message: 'As senhas não conferem.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_PASSWORD_MISMATCH',
        });
        return;
      }

      if (!termsAccepted) {
        setError({
          message: 'Você precisa aceitar os termos para continuar.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_TERMS_REQUIRED',
        });
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
        setRetryCount(0); // Reset on success
      } catch (registerError: any) {
        setError(registerError);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    void handleUserCreate();
  };

  const renderError = () => {
    if (!error) return null;

    if (retryCount >= 3 && error.retryable) {
      return (
        <View className="mb-4 flex-row items-start rounded-2xl border border-feedback-error/20 bg-feedback-errorSoft p-4">
          <View className="flex-1">
            <Text className="font-body text-sm font-medium leading-5 text-text-base">
              Não foi possível completar a solicitação após várias tentativas. Por favor, entre em
              contato com o suporte técnico.
            </Text>
            <TouchableOpacity
              onPress={() => alert('Redirecionando para o canal de suporte...')}
              activeOpacity={0.7}
              className="mt-2 self-start rounded-lg border border-surface-border bg-surface-canvas px-3 py-1.5 shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Contatar suporte">
              <Text className="font-body text-xs font-semibold text-brand-primary">
                Contatar Suporte
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return <ErrorAlert error={error} onRetry={handleRetry} />;
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
                onChangeText={handleNameChange}
                placeholder="NOME"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={name}
              />

              <TextInput
                autoCapitalize="none"
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={handleEmailChange}
                placeholder="EMAIL"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={email}
                keyboardType="email-address"
              />

              {error?.fieldErrors?.email && (
                <Text className="ml-1 mt-2 text-sm font-semibold text-red-600">
                  {error.fieldErrors.email}
                </Text>
              )}

              {error?.code === 'CONFLICT_EMAIL_TAKEN' && (
                <Link
                  href="/(auth)/login"
                  className="mt-3 text-center font-poetsenone text-lg text-orange-500">
                  Fazer login com conta existente
                </Link>
              )}

              {/* Show general/server errors summary in step 1 if not email field error */}
              {!error?.fieldErrors?.email && <View className="mt-4">{renderError()}</View>}

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
                onChangeText={handleUsernameChange}
                placeholder="NOME DE USUARIO"
                placeholderTextColor="#D9D9D9"
                style={styles.input}
                value={username}
              />
              {error?.fieldErrors?.username && (
                <Text className="ml-1 mt-2 text-sm font-semibold text-red-600">
                  {error.fieldErrors.username}
                </Text>
              )}

              <TextInput
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={handlePasswordChange}
                placeholder="SENHA"
                placeholderTextColor="#D9D9D9"
                secureTextEntry
                style={styles.input}
                value={password}
              />
              {error?.fieldErrors?.password && (
                <Text className="ml-1 mt-2 text-sm font-semibold text-red-600">
                  {error.fieldErrors.password}
                </Text>
              )}

              <TextInput
                className="mt-10 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
                onChangeText={handleConfirmPasswordChange}
                placeholder="CONFIRME SUA SENHA"
                placeholderTextColor="#D9D9D9"
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
              />
            </View>

            {/* Show general/server errors summary in step 2 if not field-specific */}
            {error && !error.fieldErrors && (
              <View className="w-full max-w-md px-6">{renderError()}</View>
            )}

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

        <View className="w-full max-w-md items-center px-5">
          <Pressable
            className="mb-6 mt-10 w-full items-center rounded-xl bg-orange-500 py-4 active:bg-black"
            disabled={isSubmitting}
            onPress={handleUserCreate}>
            <Text className="font-poetsenone text-2xl text-white">
              {step === 1 ? 'Avançar' : isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
