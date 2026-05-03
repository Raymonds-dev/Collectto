import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function SecurityScreen() {
  const { signOut } = useAuth();
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);

  const handleConfirmSignOut = async (): Promise<void> => {
    setSignOutModalVisible(false);
    await signOut();
  };

  const handleConfirmDeleteAccount = (): void => {
    // TODO: API call to delete account
    console.log('Account deletion initiated');
    setDeleteAccountModalVisible(false);
  };

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        {/* Session Management */}
        <View className="mb-10 rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="text-lg font-semibold text-text-base">Gerenciar Sessão</Text>
          <Text className="mt-2 text-sm text-text-muted">
            Encerre sua sessão neste dispositivo. Você precisará fazer login novamente.
          </Text>

          <Button
            label="Sair da Conta"
            variant="secondary"
            size="md"
            className="mt-4"
            onPress={() => setSignOutModalVisible(true)}
          />
        </View>

        {/* Account Deletion */}
        <View className="rounded-2xl border border-feedback-error bg-feedback-errorSoft p-4">
          <Text className="text-lg font-semibold text-feedback-error">Atenção</Text>
          <Text className="mt-2 text-sm text-feedback-error">
            Excluir sua conta é uma ação irreversível. Todos os seus dados serão removidos
            permanentemente.
          </Text>

          <Button
            label="Excluir Conta"
            variant="cancel"
            size="md"
            className="mt-4"
            onPress={() => setDeleteAccountModalVisible(true)}
          />
        </View>
      </View>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={signOutModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSignOutModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-overlay-scrim">
          <View className="mx-4 w-full max-w-sm rounded-2xl bg-surface-card p-6">
            <Text className="text-xl font-bold text-text-base">Confirmar Saída</Text>
            <Text className="mt-3 text-base text-text-muted">
              Tem certeza que deseja sair da sua conta?
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setSignOutModalVisible(false)}
              />
              <Button
                label="Sair"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleConfirmSignOut}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteAccountModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-overlay-scrim">
          <View className="mx-4 w-full max-w-sm rounded-2xl bg-surface-card p-6">
            <Text className="text-xl font-bold text-feedback-error">Excluir Conta</Text>
            <Text className="mt-3 text-base text-text-muted">
              Esta ação não pode ser desfeita. Todos os seus dados, coleções e itens serão
              permanentemente removidos.
            </Text>
            <Text className="mt-4 text-sm font-semibold text-feedback-error">
              Digite sua senha para confirmar:
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setDeleteAccountModalVisible(false)}
              />
              <Button
                label="Excluir"
                variant="cancel"
                size="md"
                className="flex-1"
                onPress={handleConfirmDeleteAccount}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
