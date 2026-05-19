import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createItemCollectionProviders as Providers } from '@/providers';
// no react-native primitives required in this layout

export default function TabsLayout() {
  return (
    <Providers>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#f97316',
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            href: '/(tabs)',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explorar',
            href: '/(tabs)/explore',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create-item"
          options={{
            title: 'Criar Item',
            href: '/(tabs)/create-item',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'add' : 'add-outline'} size={size + 4} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configurações',
            href: '/(tabs)/settings',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            href: '/(tabs)/profile',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={size + 4}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="collections/[collectionId]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </Providers>
  );
}

// layout styles removed — tabBarButton implemented inline when needed
