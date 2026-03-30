import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image,Pressable, Text, TextInput, View } from 'react-native';

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
      {/*Espaço do título e imagem collectto*/}
      <View className='mb-10 items-center'>
        <Image 
          source={require('@/assets/logo.png')}
          className="h-45 w-45"
          resizeMode="contain"
        />
        <Text className='mt-8 text-black text-3xl font-poetsenone'>
            Faça Login
        </Text>
      </View>

      <View className="w-full max-w-md rounded-2xl p-6 ">
        <TextInput
          autoCapitalize="none"
          className="mt-15 text-xl rounded-xl bg-black px-4 py-4 text-base font-poetsenone"
          onChangeText={setEmail}
          placeholder="NOME DE USUARIO"
          placeholderTextColor="#D9D9D9"
          value={email}
        />

        <TextInput
          className="mt-10 text-xl rounded-xl bg-black px-4 py-4 font-poetsenone"
          onChangeText={setPassword}
          placeholder="SENHA"
          placeholderTextColor="#D9D9D9"
          secureTextEntry
          value={password}
        />

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}

      <View className='items-center'>
        <Pressable
          className="mt-10 mb-6 w-32 text-4xl items-center rounded-xl bg-orange-500 px-6 py-3 "
          disabled={isSubmitting}
          onPress={handleLogin}>
          <Text className="text-base font-poetsenone text-white">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>

        <Text className='mt-8 text-2xl font-bold-PoetsenOne text-black font-poetsenone'>
            Não tem conta? Cadastre-se
        </Text>
        </View>
      </View>
    </View>
  );
}
