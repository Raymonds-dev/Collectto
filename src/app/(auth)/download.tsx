import { useRouter } from 'expo-router';
import { Image, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';

const APK_DOWNLOAD_URL = '/downloads/collectto.apk';
const ABSOLUTE_APK_URL = 'https://collectto.app/downloads/collectto.apk';

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
      className="flex-1 bg-surface-base"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      <View className="mx-auto w-full max-w-3xl px-6 py-10 md:py-16">
        {/* Header de navegação */}
        <View className="mb-8 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/logo-default.png')}
              className="h-10 w-10"
              resizeMode="contain"
            />
            <Text className="font-poetsenone text-2xl text-text-base">Collectto</Text>
          </View>
          <Button
            label="Início"
            variant="ghost"
            size="sm"
            onPress={handleNavigateHome}
            accessibilityLabel="Voltar para a página inicial"
          />
        </View>

        {/* Card Principal de Download */}
        <Card className="items-center p-8 text-center md:p-12">
          <View className="mb-4 rounded-full bg-brand-100 p-4">
            <Image
              source={require('@/assets/logo_2.png')}
              className="h-20 w-20"
              resizeMode="contain"
            />
          </View>

          <View className="mb-2 rounded-full bg-brand-50 px-3 py-1">
            <Text className="text-xs font-semibold text-brand-primary">
              Versão 1.0.0 Oficial • Android
            </Text>
          </View>

          <Text className="mb-3 text-center font-poetsenone text-3xl text-text-base md:text-4xl">
            Baixe o Collectto para Android
          </Text>

          <Text className="mb-8 max-w-lg text-center font-body text-base text-text-muted">
            Tenha todas as suas coleções na palma da mão. Instale o aplicativo diretamente em seu
            aparelho e comece a catalogar hoje mesmo.
          </Text>

          <View className="w-full max-w-sm gap-4">
            <Button
              label="Baixar Aplicativo (.APK)"
              variant="primary"
              size="lg"
              onPress={handleDownload}
              accessibilityLabel="Baixar arquivo APK do Collectto para Android"
            />

            <Button
              label="Acessar pelo Navegador"
              variant="secondary"
              size="md"
              onPress={handleNavigateLogin}
              accessibilityLabel="Acessar versão Web do Collectto"
            />
          </View>

          <Text className="mt-4 text-center font-body text-xs text-text-disabled">
            Compatível com Android 8.0 ou superior • Arquivo 100% seguro e direto
          </Text>
        </Card>

        {/* Instruções de Instalação */}
        <View className="mt-10">
          <Text className="mb-4 font-poetsenone text-xl text-text-base">
            Como instalar no seu celular Android:
          </Text>

          <View className="gap-3">
            <Card className="flex-row items-center gap-4 p-4">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
                <Text className="font-bold text-text-inverse">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-text-base">
                  Baixe o arquivo .APK
                </Text>
                <Text className="font-body text-xs text-text-muted">
                  Toque no botão de download acima e aguarde o término do download no celular.
                </Text>
              </View>
            </Card>

            <Card className="flex-row items-center gap-4 p-4">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
                <Text className="font-bold text-text-inverse">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-text-base">
                  Permita a instalação
                </Text>
                <Text className="font-body text-xs text-text-muted">
                  Ao abrir o arquivo, se o Android solicitar, permita &quot;Instalar de fontes
                  desconhecidas&quot;.
                </Text>
              </View>
            </Card>

            <Card className="flex-row items-center gap-4 p-4">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-primary">
                <Text className="font-bold text-text-inverse">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-body text-sm font-semibold text-text-base">
                  Abra e aproveite
                </Text>
                <Text className="font-body text-xs text-text-muted">
                  Toque em Abrir, crie ou acesse sua conta e comece a registrar suas coleções!
                </Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Rodapé */}
        <View className="mt-12 items-center">
          <Text className="font-body text-xs text-text-subtle">
            Collectto © 2026 • Feito com paixão para colecionadores
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
