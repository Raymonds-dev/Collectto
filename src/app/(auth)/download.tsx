import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { tokens } from '@/styles/tailwind/tokens.native';

const APK_DOWNLOAD_URL = '/downloads/collectto.apk';
const ABSOLUTE_APK_URL = 'https://collectto.app/downloads/collectto.apk';
const gradientColors = (tokens.gradients.landingGrad ?? ['#FE5E00', '#FFB200', '#2D6CF6']) as [
  string,
  string,
  ...string[],
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9F3',
  },
  hairline: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
  },
  hairlineFooter: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
  },
  fichaTop: {
    height: 4,
  },
  fichaCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EADFD3',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1C1612',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 4,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EADFD3',
    borderWidth: 1,
    borderRadius: 12,
  },
  badge: {
    backgroundColor: '#FE5E00',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 130,
    height: 38,
  },
});

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
      style={styles.container}
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-xl px-5 py-7 md:py-10">
        {/* Header de navegação */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <Image
                source={require('@/assets/logo.png')}
                style={styles.logoImage}
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

          {/* expo-linear-gradient tem suporte parcial a NativeWind; usar style nativo garante renderizacao web perfeita */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hairline}
          />
        </View>

        {/* Hero Section */}
        <View className="mb-8 pt-4">
          <Text className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8C7F73]">
            Download Oficial · Android
          </Text>

          <Text className="mb-3 font-poetsenone text-3xl leading-[1.12] text-[#1C1612] sm:text-4xl md:text-5xl">
            Tenha sua coleção sempre no <Text style={{ color: '#FE5E00' }}>bolso</Text>.
          </Text>

          <Text className="font-sans text-[15px] leading-relaxed text-[#4D443B] sm:text-base">
            Baixe o aplicativo oficial do Collectto para dispositivos Android. Desfrute de navegação
            rápida, câmera nativa para fotos dos seus itens e modo offline para levar seu acervo
            onde for.
          </Text>
        </View>

        {/* Card Principal de Download */}
        <View style={styles.fichaCard} className="mb-10">
          {/* expo-linear-gradient tem suporte parcial a NativeWind; usar style nativo garante renderizacao web perfeita */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fichaTop}
          />

          <View className="p-5 sm:p-7">
            <Text className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-[#CC4B00]">
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

              <Text className="mt-1 text-center font-mono text-[11px] text-[#8C7F73]">
                ✓ Versão 1.0.0 Oficial • Compilado na VPS • Android 8.0+
              </Text>
            </View>
          </View>
        </View>

        {/* Instruções de Instalação Passo a Passo */}
        <View className="mb-10">
          <Text className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-[#CC4B00]">
            Instalação Descomplicada
          </Text>
          <Text className="mb-4 font-poetsenone text-2xl text-[#1C1612]">
            Como instalar no seu aparelho
          </Text>

          <View className="gap-3">
            <View style={styles.stepCard} className="flex-row items-center gap-3.5 p-4">
              <View style={styles.badge}>
                <Text className="font-poetsenone text-sm font-bold text-white">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-[#1C1612]">
                  Baixe o arquivo .APK
                </Text>
                <Text className="font-sans text-xs text-[#4D443B]">
                  Toque no botão de download acima e aguarde a conclusão do download do arquivo.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard} className="flex-row items-center gap-3.5 p-4">
              <View style={styles.badge}>
                <Text className="font-poetsenone text-sm font-bold text-white">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-[#1C1612]">
                  Permita a instalação
                </Text>
                <Text className="font-sans text-xs text-[#4D443B]">
                  Se o navegador exibir aviso de segurança, toque em Configurações e marque
                  &quot;Permitir desta fonte&quot;.
                </Text>
              </View>
            </View>

            <View style={styles.stepCard} className="flex-row items-center gap-3.5 p-4">
              <View style={styles.badge}>
                <Text className="font-poetsenone text-sm font-bold text-white">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans text-sm font-bold text-[#1C1612]">
                  Abra e comece sua coleção
                </Text>
                <Text className="font-sans text-xs text-[#4D443B]">
                  Toque em Instalar, abra o aplicativo, entre ou crie sua conta e comece a
                  catalogar!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rodapé com Hairline Gradiente */}
        <View className="pb-12 pt-2">
          {/* expo-linear-gradient tem suporte parcial a NativeWind; usar style nativo garante renderizacao web perfeita */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.hairlineFooter}
          />
          <Text className="font-mono text-[11px] leading-relaxed tracking-[0.08em] text-[#8C7F73]">
            COLLECTTO · A REDE SOCIAL PARA COLECIONADORES{'\n'}
            PROJETO INTEGRADOR — ENGENHARIA DA COMPUTAÇÃO · UNISO · SOROCABA/SP
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
