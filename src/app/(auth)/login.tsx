import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
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
  }

  return (
    <View className="flex-1 items-center bg-white px-6 pt-10">
      <View className="mb-10 items-center">
        <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
        <Text className="mt-8 font-poetsenone text-3xl font-bold text-black">Faça Login</Text>
      </View>

      <View className="w-full max-w-md rounded-2xl p-6 ">
        <TextInput
          autoCapitalize="none"
          className="mt-15 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#D9D9D9"
          value={email}
        />

        <TextInput
          className="mt-10 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
          onChangeText={setPassword}
          placeholder="Senha"
          placeholderTextColor="#D9D9D9"
          secureTextEntry
          value={password}
        />

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}

        <View className="items-center">
          <Pressable
            className="mb-6 mt-10 w-32 items-center rounded-xl bg-orange-500 px-5 py-4 text-4xl active:bg-black"
            disabled={isSubmitting}
            onPress={handleLogin}>
            <Text className="font-poetsenone text-base text-white">
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
  );
}
