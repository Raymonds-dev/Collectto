import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await signIn({ email: email.trim(), password });
      router.replace('/(tabs)/profile');
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Falha ao autenticar.';
      setError(message);
    } finally {
      setIsSubmitting(false);
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
        <View className="mb-8 items-center">
          <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
          <Text className="mt-8 font-poetsenone text-4xl text-black">Faça Login</Text>
        </View>
        <View className="w-full max-w-md rounded-2xl p-5 ">
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

          {error ? (
            <View className="mt-3 w-full items-center">
              <Text className="text-center text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          <View className="items-center">
            <Pressable
              className="mb-6 mt-10 items-center rounded-xl bg-orange-500 px-8 py-4 active:bg-black"
              disabled={isSubmitting}
              onPress={handleLogin}>
              <Text className="font-poetsenone text-2xl text-white">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>

            <Text className="mt-8 font-poetsenone text-2xl font-bold text-black">
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
