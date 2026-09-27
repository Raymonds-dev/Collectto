import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { tokens } from '@/styles/tailwind/tokens.native';

const gradientColors = (tokens.gradients.landingGrad ?? ['#FE5E00', '#FFB200', '#2D6CF6']) as [
  string,
  string,
  ...string[],
];

export default function NotFoundScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/tela_inicial');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-landing-paper px-6 py-12">
      <View className="w-full max-w-md overflow-hidden rounded-2xl border border-landing-line bg-landing-card p-6 shadow-card sm:p-8">
        {/* expo-linear-gradient possui suporte parcial a NativeWind; altura controlada via style */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4, borderRadius: 2, marginBottom: 20 }}
        />

        <View className="mb-4 items-center">
          <Image
            source={require('@/assets/logo-default.png')}
            className="mb-4 h-14 w-14"
            resizeMode="contain"
            accessibilityLabel="Collectto"
          />
          <Text className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-landing-orangeDeep">
            Erro 404
          </Text>
          <Text className="mt-1 text-center font-poetsenone text-3xl text-landing-ink">
            Página não encontrada
          </Text>
        </View>

        <Text className="mb-8 text-center font-sans text-sm leading-relaxed text-landing-sub">
          O link que você tentou acessar não existe, foi removido ou está temporariamente
          indisponível.
        </Text>

        <Button
          label="Voltar para o Início"
          variant="primary"
          size="lg"
          onPress={handleGoHome}
          accessibilityLabel="Voltar para a página inicial"
          className="w-full"
        />
      </View>
    </View>
  );
}
