import { Link } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { ImageCarrossel } from '@/components/image-carrossel/image_carrossel'; // 1. Importe o carrossel

const carrossel_images = [
  { id: '1', source: require('@/assets/example/hotweels_3.jpeg') },
  { id: '2', source: require('@/assets/example/pokemo_1.jpeg') },
  { id: '3', source: require('@/assets/example/tenis_1.jpeg') },
  { id: '4', source: require('@/assets/example/fusca.jpeg') },
];

const inicialScreen = () => {
  return (
    <View className="bg-surface-background h-full flex-1 items-center justify-start overflow-visible">
      <View className="mb-5 items-center">
        <Image source={require('@/assets/logo_2.png')} className="h-44 w-44" resizeMode="contain" />
      </View>

      <View className="items-center">
        <Text className="text-text-primary mb-1 font-poetsenone text-2xl">
          Sua coleção é História
        </Text>
        <Text className="mb-8 font-poetsenone text-lg">
          Compartilhe e descubra o mundo de coleções
        </Text>
      </View>

      <View className="mb-1 h-[340px] w-full items-center justify-center pb-8">
        <ImageCarrossel items={carrossel_images} />
      </View>

      <View className="w-full items-center gap-4">
        <Text className="text-text-primary mb-2 mt-5 font-poetsenone text-xl font-medium">
          Junte-se à milhares de colecionadores
        </Text>
        <Link href="/(auth)/login" asChild>
          <Text className="w-50 rounded-xl bg-black p-4 text-center font-poetsenone text-2xl color-white">
            COLECIONE
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default inicialScreen;
