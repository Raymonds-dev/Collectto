import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

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
    <View className="flex-1 items-center justify-center bg-white px-6">
      <View className="w-full max-w-md rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <Text className="text-2xl font-bold text-emerald-900">Entrar</Text>
        <Text className="mt-2 text-sm text-emerald-800">Acesse sua área autenticada.</Text>

        <TextInput
          autoCapitalize="none"
          className="mt-6 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-base"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#5E8576"
          value={email}
        />

        <TextInput
          className="mt-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-base"
          onChangeText={setPassword}
          placeholder="Senha"
          placeholderTextColor="#5E8576"
          secureTextEntry
          value={password}
        />

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}

        <Pressable
          className="mt-5 items-center rounded-xl bg-emerald-700 px-4 py-3"
          disabled={isSubmitting}
          onPress={handleLogin}>
          <Text className="text-base font-semibold text-white">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
