import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { tokens } from '@/styles/tailwind/tokens.native';

const APK_DOWNLOAD_URL = '/downloads/collectto.apk';
const ABSOLUTE_APK_URL = 'https://collectto.app/downloads/collectto.apk';
const gradientColors = (tokens.gradients.landingGrad ?? ['#FE5E00', '#FFB200', '#2D6CF6']) as [
  string,
  string,
  ...string[],
];

export default function DownloadScreen() {
  const router = useRouter();

  const handleDownload = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = APK_DOWNLOAD_URL;
    } else {
      void Linking.openURL(ABSOLUTE_APK_URL);
    }
  };

  const handleNavigateLogin = () => {
    router.push('/(auth)/login');
  };

  const handleNavigateHome = () => {
    router.push('/(auth)/tela_inicial');
  };

  return (
    <ScrollView
      className="flex-1 bg-landing-paper"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-xl px-5 py-7 md:py-10">
        {/* Header de navegação */}
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

            <Button
              label="← Início"
              variant="ghost"
              size="sm"
              onPress={handleNavigateHome}
              accessibilityLabel="Voltar para a página inicial"
            />
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
            Download Oficial · Android
          </Text>

          <Text className="mb-3 font-poetsenone text-3xl leading-[1.12] text-landing-ink sm:text-4xl md:text-5xl">
            Tenha sua coleção sempre no <Text className="text-landing-orange">bolso</Text>.
          </Text>

          <Text className="font-sans text-[15px] leading-relaxed text-landing-sub sm:text-base">
            Baixe o aplicativo oficial do Collectto para dispositivos Android. Desfrute de navegação
            rápida, câmera nativa para fotos dos seus itens e modo offline para levar seu acervo
            onde for.
          </Text>
        </View>

        {/* Card Principal de Download */}
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
              Ficha de Download · APK Android
            </Text>

            <View className="gap-3">
              <Button
                label="Baixar Aplicativo Collectto (.APK)"
                variant="primary"
                size="lg"
                onPress={handleDownload}
                accessibilityLabel="Baixar arquivo APK do Collectto para Android"
                className="w-full"
              />

              <Button
                label="Usar no Navegador (Web)"
                variant="secondary"
                size="md"
                onPress={handleNavigateLogin}
                accessibilityLabel="Acessar versão Web do Collectto"
                className="w-full"
              />

              <Text className="mt-1 text-center font-mono text-[11px] text-landing-muted">
                ✓ Versão 1.0.0 Oficial • Compilado na VPS • Android 8.0+
              </Text>
            </View>
          </View>
        </View>

        {/* Instruções de Instalação Passo a Passo */}
        <View className="mb-10">
          <Text className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-landing-orangeDeep">
            Instalação Descomplicada
          </Text>
          <Text className="mb-4 font-poetsenone text-2xl text-landing-ink">
            Como instalar no seu aparelho
          </Text>

          <View className="gap-3">
            <View className="flex-row items-center gap-3.5 rounded-xl border border-landing-line bg-landing-card p-4">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-landing-orange">
                <Text className="font-poetsenone text-sm font-bold text-white">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-landing-ink">
                  Baixe o arquivo .APK
                </Text>
                <Text className="font-sans text-xs text-landing-sub">
                  Toque no botão de download acima e aguarde a conclusão do download do arquivo.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3.5 rounded-xl border border-landing-line bg-landing-card p-4">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-landing-orange">
                <Text className="font-poetsenone text-sm font-bold text-white">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-landing-ink">
                  Permita a instalação
                </Text>
                <Text className="font-sans text-xs text-landing-sub">
                  Se o navegador exibir aviso de segurança, toque em Configurações e marque
                  &quot;Permitir desta fonte&quot;.
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3.5 rounded-xl border border-landing-line bg-landing-card p-4">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-landing-orange">
                <Text className="font-poetsenone text-sm font-bold text-white">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-landing-ink">
                  Abra e comece sua coleção
                </Text>
                <Text className="font-sans text-xs text-landing-sub">
                  Toque em Instalar, abra o aplicativo, entre ou crie sua conta e comece a
                  catalogar!
                </Text>
              </View>
            </View>
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
}
