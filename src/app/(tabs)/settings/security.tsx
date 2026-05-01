import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ConfirmActionModal, SettingsItem, SettingsSection } from '@/components/settings';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function SecurityScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function handleConfirmSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace('/(auth)/tela_inicial');
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setIsSigningOut(false);
      setShowSignOutModal(false);
    }
  }

  function handleSignOut() {
    setShowSignOutModal(true);
  }

  function handleDeleteAccount() {
    setShowDeleteAccountModal(true);
  }

  async function handleConfirmDeleteAccount() {
    try {
      setIsDeletingAccount(true);
      // TODO(api): Implementar chamada para API de deletar conta
      // await api.delete('/users/me');
      // await signOut();
      // router.replace('/(auth)/tela_inicial');
      console.log('Conta deletada');
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountModal(false);
    }
  }

  return (
    <>
      <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="gap-6 px-4 py-6">
        <View>
          <Text className="font-body text-2xl font-bold text-text-base">Sessão e Segurança</Text>
          <Text className="mt-2 text-sm text-text-muted">Controle total de sua conta</Text>
        </View>

        <SettingsSection
          icon="lock-closed"
          title="Ações de Conta"
          description="Operações sensíveis">
          <SettingsItem
            label="Sair da Conta"
            description="Encerre esta sessão"
            isDangerous
            onPress={handleSignOut}
          />
          <SettingsItem
            label="Excluir Conta"
            description="Deletar permanentemente sua conta"
            isDangerous
            onPress={handleDeleteAccount}
          />
        </SettingsSection>

        <View className="mt-4 rounded-2xl border border-feedback-warning/30 bg-feedback-warning/10 p-4">
          <Text className="font-body font-semibold text-feedback-warning">Atenção</Text>
          <Text className="mt-2 text-sm text-text-base">
            Ações como excluir sua conta são permanentes e não podem ser desfeitas. Tenha cuidado ao
            executar operações sensíveis.
          </Text>
        </View>

        <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
      </ScrollView>

      <ConfirmActionModal
        visible={showSignOutModal}
        title="Sair da Conta"
        message="Tem certeza que deseja sair da sua conta?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        isDangerous
        isLoading={isSigningOut}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />

      <ConfirmActionModal
        visible={showDeleteAccountModal}
        title="Excluir Conta"
        message="Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão deletados. Tem certeza?"
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        isDangerous
        isLoading={isDeletingAccount}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setShowDeleteAccountModal(false)}
      />
    </>
  );
}
