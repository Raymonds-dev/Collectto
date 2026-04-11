import { Link } from "expo-router";
import { Image, Text, View } from "react-native";
import { ImageCarrossel } from "@/components/image-carrossel/image_carrossel"; // 1. Importe o carrossel

const carrossel_images = [
  { id: '1', source: require('@/assets/example/hotweels_3.jpeg') },
  { id: '2', source: require('@/assets/example/pokemo_1.jpeg') },
  { id: '3', source: require('@/assets/example/tenis_1.jpeg') },
  { id: '4', source: require('@/assets/example/fusca.jpeg') },
];

const inicialScreen = () => {
  return (
    <View className="flex-1j items-center justify-start h-full bg-surface-background ">
      <View className="items-center mb-5">
        <Image source={require('@/assets/logo_2.png')} className="h-44 w-44" resizeMode="contain" />
      </View>

      <View className="items-center">
        <Text className="text-2xl mb-1 font-poetsenone text-text-primary">
          Sua coleção é História
        </Text>
        <Text className="font-poetsenone text-lg mb-8">
          Compartilhe e descubra o mundo de coleções
        </Text>
      </View>

      <View className="mb-5 h-[320px] w-full items-center justify-center">
        <ImageCarrossel items={carrossel_images} />
      </View>

      <View className="w-full items-center gap-4">
        <Text className="text-xl mt-5 mb-2 font-medium font-poetsenone text-text-primary">
          Junte-se à milhares de colecionadores
        </Text>
        <Link href="/(auth)/login" asChild>
          <Text className="w-50 rounded-xl bg-black p-4 text-center text-2xl font-poetsenone color-white">
            COLECIONE
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default inicialScreen;