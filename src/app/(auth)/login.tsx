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
    <View className="items-center flex-1 px-6 pt-10 bg-white">
      <View className="items-center mb-10">
        <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
        <Text className="mt-8 text-3xl font-bold text-black font-poetsenone">Faça Login</Text>
      </View>

      <View className="w-full max-w-md p-6 rounded-2xl ">
        <TextInput
          autoCapitalize="none"
          className="px-4 py-4 text-xl text-white bg-black mt-15 rounded-xl font-poetsenone"
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#D9D9D9"
          value={email}
        />

        <TextInput
          className="px-4 py-4 mt-10 text-xl text-white bg-black rounded-xl font-poetsenone"
          onChangeText={setPassword}
          placeholder="Senha"
          placeholderTextColor="#D9D9D9"
          secureTextEntry
          value={password}
        />

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}

        <View className="items-center">
          <Pressable
            className="items-center w-32 px-5 py-4 mt-10 mb-6 text-4xl bg-orange-500 rounded-xl active:bg-black"
            disabled={isSubmitting}
            onPress={handleLogin}>
            <Text className="text-base text-white font-poetsenone">
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Text>
          </Pressable>

          <Text className="mt-8 text-2xl font-bold text-black font-poetsenone">
            Não tem conta?{' '}
            <Link href="/(auth)/user_create" className="text-orange-500 font-poetsenone">
              Cadastre-se
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
