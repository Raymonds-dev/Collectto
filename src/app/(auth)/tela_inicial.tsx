import { useRouter } from 'expo-router';
import { Image, Linking, Platform, ScrollView, Text, View } from 'react-native';
import { Button, Card, ImageCarousel } from '@/components/ui';

const carrossel_images = [
  { id: '1', source: require('@/assets/example/hotweels_3.jpeg') },
  { id: '2', source: require('@/assets/example/pokemo_1.jpeg') },
  { id: '3', source: require('@/assets/example/tenis_1.jpeg') },
  { id: '4', source: require('@/assets/example/fusca.jpeg') },
];

const APK_DOWNLOAD_URL = '/downloads/collectto.apk';
const ABSOLUTE_APK_URL = 'https://collectto.app/downloads/collectto.apk';

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
      className="flex-1 bg-surface-base"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}>
      {/* Container Principal Centralizado */}
      <View className="mx-auto w-full max-w-5xl px-4 py-6 md:py-10">
        {/* Barra Superior / Header */}
        <View className="mb-8 flex-row items-center justify-between border-b border-surface-border pb-4">
          <View className="flex-row items-center gap-3">
            <Image
              source={require('@/assets/logo-default.png')}
              className="h-10 w-10 md:h-12 md:w-12"
              resizeMode="contain"
            />
            <Text className="font-poetsenone text-2xl text-text-base md:text-3xl">Collectto</Text>
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

        {/* Hero Section */}
        <View className="mb-12 items-center text-center">
          <View className="mb-3 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5">
            <Text className="font-body text-xs font-semibold text-brand-primary">
              ✨ O lar oficial das suas coleções
            </Text>
          </View>

          <Text className="mb-3 text-center font-poetsenone text-3xl text-text-base md:text-5xl">
            Sua coleção é História
          </Text>

          <Text className="mb-8 max-w-2xl text-center font-body text-base text-text-muted md:text-lg">
            Catalogue suas preciosidades, organize por atributos exclusivos e compartilhe suas
            conquistas com uma comunidade apaixonada por colecionismo.
          </Text>

          {/* Botões de Ação Principal (Condicionados por Plataforma) */}
          {isWeb ? (
            <>
              <View className="w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  label="Baixar App Android (.APK)"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onPress={handleDownloadApk}
                  accessibilityLabel="Baixar instalador APK do Collectto para Android"
                />

                <Button
                  label="Usar no Navegador"
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onPress={handleNavigateLogin}
                  accessibilityLabel="Acessar Collectto Web"
                />
              </View>

              <Text className="mt-3 font-body text-xs text-text-disabled">
                APK seguro direto da VPS • Versão 1.0.0
              </Text>
            </>
          ) : (
            <View className="w-full max-w-xs flex-col gap-3">
              <Button
                label="Começar Agora"
                variant="primary"
                size="lg"
                onPress={handleNavigateLogin}
                accessibilityLabel="Entrar no Collectto"
              />
              <Button
                label="Criar Conta"
                variant="secondary"
                size="md"
                onPress={handleNavigateRegister}
                accessibilityLabel="Criar nova conta no Collectto"
              />
            </View>
          )}
        </View>

        {/* Vitrine / Carrossel de Coleções */}
        <View className="mb-16 w-full items-center justify-center">
          <Text className="mb-4 font-poetsenone text-lg text-text-base">
            Itens que contam histórias:
          </Text>
          <View className="h-[360px] w-full items-center justify-center">
            <ImageCarousel items={carrossel_images} />
          </View>
        </View>

        {/* Seção de Recursos / Destaques */}
        <View className="mb-16">
          <Text className="mb-8 text-center font-poetsenone text-2xl text-text-base md:text-3xl">
            Tudo o que seu acervo precisa
          </Text>

          <View className="flex-col gap-4 md:flex-row md:gap-6">
            <Card className="flex-1 p-6">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Text className="text-xl">🗂️</Text>
              </View>
              <Text className="mb-2 font-poetsenone text-lg text-text-base">
                Organização sob Medida
              </Text>
              <Text className="font-body text-sm text-text-muted">
                Crie coleções ilimitadas, atribua categorias, tags e acompanhe o estado de
                conservação de cada peça.
              </Text>
            </Card>

            <Card className="flex-1 p-6">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Text className="text-xl">📸</Text>
              </View>
              <Text className="mb-2 font-poetsenone text-lg text-text-base">
                Galeria em Alta Resolução
              </Text>
              <Text className="font-body text-sm text-text-muted">
                Registre fotos com múltiplos ângulos, detalhes de fabricação, datas e valores de
                avaliação.
              </Text>
            </Card>

            <Card className="flex-1 p-6">
              <View className="mb-3 h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Text className="text-xl">🤝</Text>
              </View>
              <Text className="mb-2 font-poetsenone text-lg text-text-base">Comunidade Ativa</Text>
              <Text className="font-body text-sm text-text-muted">
                Descubra raridades em acervos de outros colecionadores e compartilhe sua paixão com
                o mundo.
              </Text>
            </Card>
          </View>
        </View>

        {/* Banner CTA Final (Condicionado por Plataforma) */}
        <Card className="mb-12 items-center border-brand-200 bg-brand-50 p-8 text-center">
          <Text className="mb-2 font-poetsenone text-2xl text-text-base md:text-3xl">
            {isWeb ? 'Comece sua coleção agora' : 'Faça parte do Collectto'}
          </Text>
          <Text className="mb-6 max-w-md font-body text-sm text-text-muted">
            {isWeb
              ? 'Instale o APK no seu celular Android ou acesse diretamente pelo navegador do seu computador.'
              : 'Junte-se a milhares de colecionadores e comece a catalogar seus itens hoje mesmo.'}
          </Text>
          <View className="flex-row flex-wrap justify-center gap-3">
            {isWeb ? (
              <>
                <Button
                  label="Baixar para Android (.APK)"
                  variant="primary"
                  size="md"
                  onPress={handleDownloadApk}
                  accessibilityLabel="Baixar APK"
                />
                <Button
                  label="Criar Conta Gratuita"
                  variant="secondary"
                  size="md"
                  onPress={handleNavigateRegister}
                  accessibilityLabel="Criar conta no Collectto"
                />
              </>
            ) : (
              <>
                <Button
                  label="Criar Conta Gratuita"
                  variant="primary"
                  size="md"
                  onPress={handleNavigateRegister}
                  accessibilityLabel="Criar conta no Collectto"
                />
                <Button
                  label="Entrar na Minha Conta"
                  variant="secondary"
                  size="md"
                  onPress={handleNavigateLogin}
                  accessibilityLabel="Fazer login no aplicativo"
                />
              </>
            )}
          </View>
        </Card>

        {/* Rodapé */}
        <View className="items-center border-t border-surface-border pt-6">
          <Text className="font-body text-xs text-text-subtle">
            Collectto © 2026 • Feito para quem coleciona de verdade
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default InicialScreen;
