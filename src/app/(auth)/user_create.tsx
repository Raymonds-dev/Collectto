import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { CustomPicker } from '@/components/ui/custom_picker/custom_picker';

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

  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const dayItems = Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));
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

  async function handleUserCreate() {
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
  }

  return (
    <View className="flex-1 items-center bg-white px-6 pt-10">
      <View className="mb-10 items-center font-poetsenone">
        <Image source={require('@/assets/logo.png')} className="h-45 w-45" resizeMode="contain" />
        <Text className="mt-8 font-poetsenone text-3xl text-black">Crie sua conta</Text>
      </View>

      {step === 1 && (
        <>
          <View className="w-full max-w-md rounded-2xl p-6 ">
            <TextInput
              autoCapitalize="words"
              className="mt-15 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
              onChangeText={setName}
              placeholder="NOME"
              placeholderTextColor="#D9D9D9"
              value={name}
            />

            <TextInput
              className="mt-10 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
              onChangeText={setEmail}
              placeholder="EMAIL"
              placeholderTextColor="#D9D9D9"
              secureTextEntry
              value={email}
              keyboardType="email-address"
            />

            {error ? <Text className="mt-3 text-center text-sm text-red-600">{error}</Text> : null}

            <View className="mt-8 w-full">
              <Text className="text-ms mb-4 font-poetsenone text-black">DATA DE NASCIMENTO</Text>
              <View className="flex-row">
                <View className="flex-1">
                  <CustomPicker
                    placeholder="Dia"
                    items={dayItems}
                    selectedValue={day}
                    onValueChange={setDay}
                  />
                </View>
                <View className="mx-2 flex-1">
                  <CustomPicker
                    placeholder="Mês"
                    items={monthItems}
                    selectedValue={month}
                    onValueChange={setMonth}
                  />
                </View>
                <View className="flex-1">
                  <CustomPicker
                    placeholder="Ano"
                    items={yearItems}
                    selectedValue={year}
                    onValueChange={setYear}
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
              className="mt-15 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
              onChangeText={setUsername}
              placeholder="NOME DE USUARIO"
              placeholderTextColor="#D9D9D9"
              value={username}
            />
            <TextInput
              className="mt-10 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
              onChangeText={setPassword}
              placeholder="SENHA"
              placeholderTextColor="#D9D9D9"
              secureTextEntry
              value={password}
            />
            <TextInput
              className="mt-10 rounded-xl bg-black px-4 py-4 font-poetsenone text-xl text-white"
              onChangeText={setConfirmPassword}
              placeholder="CONFIRME SUA SENHA"
              placeholderTextColor="#D9D9D9"
              secureTextEntry
              value={confirmPassword}
            />
          </View>
          {error ? <Text className="mb-2 text-center text-sm text-red-600">{error}</Text> : null}

          <View className="mt-6 flex-row items-center">
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
          className="mb-6 mt-10 w-32 items-center rounded-xl bg-orange-500 px-5 py-4 active:bg-black"
          disabled={isSubmitting}
          onPress={handleUserCreate}>
          <Text className="font-poetsenone text-lg text-white">
            {step === 1 ? 'Avançar' : 'Cadastrar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
