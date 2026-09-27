import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { Button, ImageCarousel } from '@/components/ui';
import { tokens } from '@/styles/tailwind/tokens.native';

const carrossel_images = [
  { id: '1', source: require('@/assets/example/hotweels_3.jpeg') },
  { id: '2', source: require('@/assets/example/pokemo_1.jpeg') },
  { id: '3', source: require('@/assets/example/tenis_1.jpeg') },
  { id: '4', source: require('@/assets/example/fusca.jpeg') },
];

const APK_DOWNLOAD_URL = '/downloads/collectto.apk';
const ABSOLUTE_APK_URL = 'https://collectto.app/downloads/collectto.apk';
const gradientColors = (tokens.gradients.landingGrad ?? ['#FE5E00', '#FFB200', '#2D6CF6']) as [
  string,
  string,
  ...string[],
];

const InicialScreen = () => {
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const handleDownloadApk = () => {
    if (isWeb && typeof window !== 'undefined') {
      window.location.href = APK_DOWNLOAD_URL;
    } else {
      void Linking.openURL(ABSOLUTE_APK_URL);
    }
  };

  const handleNavigateLogin = () => {
    router.push('/(auth)/login');
  };

  const handleNavigateRegister = () => {
    router.push('/(auth)/user_create');
  };

  return (
    <ScrollView
      className="flex-1 bg-landing-paper"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-xl px-5 py-7 md:py-10">
        {/* Header / Identidade da Marca */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <Image
                source={require('@/assets/logo.png')}
                className="h-[38px] w-[130px]"
                resizeMode="contain"
                accessibilityLabel="Collectto"
              />
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                label="Entrar"
                variant="ghost"
                size="sm"
                onPress={handleNavigateLogin}
                accessibilityLabel="Entrar na conta"
              />
              <Button
                label="Cadastrar"
                variant="primary"
                size="sm"
                onPress={handleNavigateRegister}
                accessibilityLabel="Criar nova conta"
              />
            </View>
          </View>

          {/* expo-linear-gradient possui suporte parcial a NativeWind; o uso de style nativo pontual e necessario para medidas e raio */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 3, borderRadius: 2, marginTop: 12 }}
          />
        </View>

        {/* Hero Section */}
        <View className="mb-8 pt-4">
          <Text className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-landing-muted">
            Beta Aberto · Android & Web
          </Text>

          <Text className="mb-3 font-poetsenone text-3xl leading-[1.12] text-landing-ink sm:text-4xl md:text-5xl">
            Sua coleção merece mais que uma <Text className="text-landing-orange">planilha</Text>.
          </Text>

          <Text className="font-sans text-[15px] leading-relaxed text-landing-sub sm:text-base">
            O Collectto é a rede social feita para colecionadores: catalogue seu acervo com detalhes
            de verdade, mostre suas peças e conecte-se com quem coleciona o mesmo que você.
          </Text>
        </View>

        {/* Card Ficha de Acesso / Download */}
        <View className="mb-10 overflow-hidden rounded-2xl border border-landing-line bg-landing-card shadow-card">
          {/* expo-linear-gradient possui suporte parcial a NativeWind; altura controlada via style */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 4 }}
          />
          <View className="p-5 sm:p-7">
            <Text className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
              {isWeb ? 'Acesso Direto · Escolha como começar' : 'Comece a catalogar seu acervo'}
            </Text>

            {isWeb ? (
              <View className="gap-3">
                <Button
                  label="Baixar App Android (.APK)"
                  variant="primary"
                  size="lg"
                  onPress={handleDownloadApk}
                  accessibilityLabel="Baixar instalador APK do Collectto para Android"
                  className="w-full"
                />

                <Button
                  label="Usar no Navegador (Web)"
                  variant="secondary"
                  size="lg"
                  onPress={handleNavigateLogin}
                  accessibilityLabel="Acessar Collectto Web"
                  className="w-full"
                />

                <Text className="mt-1 text-center font-mono text-[11px] text-landing-muted">
                  ✓ APK seguro compilado na VPS • Versão 1.0.0 oficial
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                <Button
                  label="Começar Agora"
                  variant="primary"
                  size="lg"
                  onPress={handleNavigateLogin}
                  accessibilityLabel="Entrar no Collectto"
                  className="w-full"
                />
                <Button
                  label="Criar Conta"
                  variant="secondary"
                  size="md"
                  onPress={handleNavigateRegister}
                  accessibilityLabel="Criar nova conta no Collectto"
                  className="w-full"
                />
              </View>
            )}
          </View>
        </View>

        {/* Vitrine / Carrossel de Coleções */}
        <View className="mb-10">
          <View className="mb-2">
            <Text className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
              Vitrine da Comunidade
            </Text>
            <Text className="font-poetsenone text-2xl text-landing-ink">
              Peças que contam histórias
            </Text>
          </View>

          <View className="h-[340px] w-full items-center justify-center">
            <ImageCarousel items={carrossel_images} />
          </View>
        </View>

        {/* Linhas de Proposta de Valor (Props) */}
        <View className="mb-10 border-t border-landing-line">
          <View className="flex-row items-baseline gap-4 border-b border-landing-line py-5">
            <Text className="w-24 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
              Catalogue
            </Text>
            <Text className="flex-1 font-sans text-sm leading-relaxed text-landing-sub">
              Cada item registrado do seu jeito, com fotos e os atributos que você definir — e com
              cara de coleção, não de relatório.
            </Text>
          </View>

          <View className="flex-row items-baseline gap-4 border-b border-landing-line py-5">
            <Text className="w-24 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
              Mostre
            </Text>
            <Text className="flex-1 font-sans text-sm leading-relaxed text-landing-sub">
              Suas coleções viram um perfil visual, público ou privado, pronto para compartilhar com
              outros entusiastas.
            </Text>
          </View>

          <View className="flex-row items-baseline gap-4 border-b border-landing-line py-5">
            <Text className="w-24 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
              Conecte
            </Text>
            <Text className="flex-1 font-sans text-sm leading-relaxed text-landing-sub">
              Siga colecionadores e coleções do seu nicho, descubra acervos raros e troque
              conhecimento sobre conservação e história.
            </Text>
          </View>
        </View>

        {/* Rodapé com Hairline Gradiente */}
        <View className="pb-12 pt-2">
          {/* expo-linear-gradient possui suporte parcial a NativeWind; altura e margem controladas via style */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 2, borderRadius: 1, marginBottom: 16 }}
          />
          <Text className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-landing-muted">
            COLLECTTO · A REDE SOCIAL PARA COLECIONADORES{'\n'}
            PROJETO INTEGRADOR — ENGENHARIA DA COMPUTAÇÃO · UNISO · SOROCABA/SP
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default InicialScreen;
