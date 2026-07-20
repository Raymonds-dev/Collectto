import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
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
import { isDebugModeEnabled } from '@/services/debug';
import { validateEmail, validatePassword } from '@/utils/validation';
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

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<MappedError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Rate limiting countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleLogin = async (): Promise<void> => {
    if (countdown > 0) return;

    if (!isDebugModeEnabled()) {
      const [emailIsValid, emailErrorMessage] = validateEmail(email);
      if (!emailIsValid) {
        setError({
          message: emailErrorMessage || 'Formato de e-mail inválido.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_EMAIL_INVALID',
        });
        return;
      }

      const [passwordIsValid, passwordErrorMessage] = validatePassword(password);
      if (!passwordIsValid) {
        setError({
          message: passwordErrorMessage || 'A senha deve ter pelo menos 8 caracteres.',
          category: 'VALIDATION',
          retryable: false,
          code: 'VALIDATION_PASSWORD_INVALID',
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signIn({ email: email.trim(), password });
      router.replace('/(tabs)/profile');
      setRetryCount(0); // Reset on success
    } catch (loginError: any) {
      setError(loginError);
      if (loginError && loginError.code === 'RATE_LIMITED') {
        const waitTime = loginError.retryAfter || 60;
        setCountdown(waitTime);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    void handleLogin();
  };

  const buttonDisabled = isSubmitting || countdown > 0;
  const buttonText = isSubmitting
    ? 'Entrando...'
    : countdown > 0
      ? `Aguarde ${countdown}s`
      : 'Entrar';

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
        <View className="mb-8 items-center">
          <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
          <Text className="mt-8 font-poetsenone text-4xl text-black">Faça Login</Text>
        </View>
        <View className="w-full max-w-md rounded-2xl p-5">
          <TextInput
            autoCapitalize="none"
            className="mt-15 rounded-xl bg-black px-4 font-poetsenone text-xl text-white"
            onChangeText={setEmail}
            placeholder="E-MAIL"
            placeholderTextColor="#D9D9D9"
            style={styles.input}
            value={email}
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

          {/* Forgot Password Recovery Link */}
          <Pressable
            onPress={() =>
              alert('Instruções de redefinição de senha foram enviadas para o seu e-mail.')
            }
            className="mr-1 mt-3 self-end"
            accessibilityRole="button"
            accessibilityLabel="Esqueceu a senha?">
            <Text className="font-poetsenone text-lg text-orange-500">Esqueceu a senha?</Text>
          </Pressable>

          {/* Error display using ErrorAlert component */}
          <View className="mt-4">
            {retryCount >= 3 && error?.retryable ? (
              <View className="mb-4 flex-row items-start rounded-2xl border border-feedback-error/20 bg-feedback-errorSoft p-4">
                <View className="flex-1">
                  <Text className="font-body text-sm font-medium leading-5 text-text-base">
                    Não foi possível completar a solicitação após várias tentativas. Por favor,
                    entre em contato com o suporte técnico.
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
            ) : (
              <ErrorAlert error={error} onRetry={handleRetry} />
            )}
          </View>

          <View className="items-center">
            <Pressable
              className={`mb-6 mt-6 items-center rounded-xl px-8 py-4 active:bg-black ${
                buttonDisabled ? 'bg-neutral-gray1' : 'bg-orange-500'
              }`}
              disabled={buttonDisabled}
              onPress={handleLogin}
              accessibilityRole="button"
              accessibilityLabel={buttonText}>
              <Text className="font-poetsenone text-2xl text-white">{buttonText}</Text>
            </Pressable>

            <Text className="mt-8 font-poetsenone text-2xl text-black">
              Não tem conta?{' '}
              <Link href="/(auth)/user_create" className="font-poetsenone text-orange-500">
                Cadastre-se
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
