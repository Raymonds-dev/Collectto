import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0A7E58',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
