import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ProfileSummaryCard, SettingsItem, SettingsSection } from '@/components/settings';
import { Button } from '@/components/ui/Button';

export default function AccountScreen() {
  const router = useRouter();
  const { user } = useAuth();

  function handleEditProfile() {
    // TODO(feature): Implementar edição de perfil
    // router.push('/(tabs)/settings/account/edit-profile');
  }

  function handleChangePassword() {
    // TODO(feature): Implementar troca de senha
    // router.push('/(tabs)/settings/account/change-password');
  }

  function handleViewData() {
    // TODO(feature): Implementar visualização de dados
    // router.push('/(tabs)/settings/account/view-data');
  }

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="gap-6 px-4 py-6">
      <View>
        <Text className="font-body text-2xl font-bold text-text-base">Conta e Perfil</Text>
        <Text className="mt-2 text-sm text-text-muted">
          Gerencie suas informações pessoais e dados da conta
        </Text>
      </View>

      {user && <ProfileSummaryCard name={user.name} email={user.email} />}

      <SettingsSection icon="person" title="Informações Pessoais" description="Atualize seu perfil">
        <SettingsItem
          label="Editar Perfil"
          description="Foto, nome e informações"
          onPress={handleEditProfile}
        />
        <SettingsItem
          label="Trocar Senha"
          description="Atualize sua senha com segurança"
          onPress={handleChangePassword}
        />
      </SettingsSection>

      <SettingsSection
        icon="download"
        title="Seus Dados"
        description="Controle total de suas informações">
        <SettingsItem
          label="Visualizar Dados"
          description="Baixe e revise seus dados pessoais"
          onPress={handleViewData}
        />
      </SettingsSection>

      <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}
