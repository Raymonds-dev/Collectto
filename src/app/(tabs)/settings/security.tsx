import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { changePassword, deactivateAuthenticatedUser } from '@/services/api/api';
import { mapErrorToMessage } from '@/utils/errorMapping';
import { validatePassword } from '@/utils/validation';
import { MappedError } from '@/types/error';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecurityScreen() {
  const { signOut } = useAuth();
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<MappedError | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordFieldChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData({ ...passwordData, [field]: value });
    if (error) {
      setError(null);
    }
  };

  const handleConfirmSignOut = async (): Promise<void> => {
    setSignOutModalVisible(false);
    await signOut();
  };

  const handleConfirmDeleteAccount = async (): Promise<void> => {
    try {
      setIsDeletingAccount(true);
      await deactivateAuthenticatedUser();
      setDeleteAccountModalVisible(false);
      await signOut();
    } catch (error) {
      console.error('Account deletion failed', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleChangePassword = async (): Promise<void> => {
    setError(null);

    if (!passwordData.currentPassword.trim() || !passwordData.newPassword.trim()) {
      setError({
        message: 'Preencha sua senha atual e a nova senha.',
        category: 'VALIDATION',
        retryable: false,
        code: 'VALIDATION_REQUIRED_FIELDS',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError({
        message: 'As senhas não conferem.',
        category: 'VALIDATION',
        retryable: false,
        code: 'VALIDATION_PASSWORD_MISMATCH',
      });
      return;
    }

    const [passwordIsValid, passwordErrorMessage] = validatePassword(passwordData.newPassword);
    if (!passwordIsValid) {
      setError({
        message: passwordErrorMessage || 'A senha deve ter pelo menos 8 caracteres.',
        category: 'VALIDATION',
        retryable: false,
        code: 'VALIDATION_PASSWORD_INVALID',
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setChangePasswordVisible(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessModalVisible(true);
    } catch (changeError: unknown) {
      setError(mapErrorToMessage(changeError, 'generic'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        <View className="mb-10 rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="font-poetsenone text-lg text-text-base">Segurança</Text>
          <Text className="mt-2 text-sm text-text-muted">
            Altere sua senha para manter sua conta segura.
          </Text>

          <Button
            label="Alterar Senha"
            variant="primary"
            size="md"
            className="mt-4"
            onPress={() => setChangePasswordVisible(true)}
          />
        </View>

        <View className="mb-10 rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="font-poetsenone text-lg text-text-base">Gerenciar Sessão</Text>
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

        <View className="rounded-2xl border border-feedback-error bg-feedback-errorSoft p-4">
          <Text className="font-poetsenone text-lg text-feedback-error">Atenção</Text>
          <Text className="mt-2 text-sm text-feedback-error">
            Sua conta será desativada agora e excluída definitivamente após 30 dias.
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
            <Text className="font-poetsenone text-xl text-text-base">Confirmar Saída</Text>
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

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setChangePasswordVisible(false)}>
        <View className="flex-1 bg-surface-base">
          <View className="flex-1 px-4 py-6">
            <Text className="mt-10 text-2xl font-bold text-text-base">Alterar Senha</Text>

            {error && (
              <View className="mt-4">
                <ErrorAlert error={error} />
              </View>
            )}

            <View className="mt-6 space-y-4">
              <View>
                <Text className="text-lg font-medium text-text-subtle">Senha Atual</Text>
                <TextInput
                  className="mb-4 mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Digite sua senha atual"
                  placeholderTextColor="#4B4B4B"
                  secureTextEntry
                  value={passwordData.currentPassword}
                  onChangeText={(text) => handlePasswordFieldChange('currentPassword', text)}
                />
              </View>

              <View>
                <Text className="text-lg font-medium text-text-subtle">Nova Senha</Text>
                <TextInput
                  className="mb-4 mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Digite uma nova senha"
                  placeholderTextColor="#4B4B4B"
                  secureTextEntry
                  value={passwordData.newPassword}
                  onChangeText={(text) => handlePasswordFieldChange('newPassword', text)}
                />
              </View>

              <View>
                <Text className="text-lg font-medium text-text-subtle">Confirmar Senha</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Confirme sua nova senha"
                  placeholderTextColor="#4B4B4B"
                  secureTextEntry
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => handlePasswordFieldChange('confirmPassword', text)}
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setChangePasswordVisible(false)}
              />
              <Button
                label="Alterar"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleChangePassword}
                loading={isChangingPassword}
                disabled={isChangingPassword}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Success Modal */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-overlay-scrim">
          <View className="mx-4 w-full max-w-sm rounded-2xl bg-surface-card p-6">
            <Text className="font-poetsenone text-xl text-text-base">Senha atualizada</Text>
            <Text className="mt-3 text-base text-text-muted">
              Sua senha foi alterada com sucesso.
            </Text>

            <View className="mt-6">
              <Button
                label="Ok"
                variant="primary"
                size="md"
                className="w-full"
                onPress={() => setSuccessModalVisible(false)}
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
            <Text className="font-poetsenone text-xl text-feedback-error">Excluir Conta</Text>
            <Text className="mt-3 text-base text-text-muted">
              - Sua conta será desativada agora e excluída permanentemente em 30 dias.{'\n'} {'\n'}-
              Se você fizer login antes desse prazo, a conta será reativada automaticamente.
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setDeleteAccountModalVisible(false)}
                disabled={isDeletingAccount}
              />
              <Button
                label="Excluir"
                variant="cancel"
                size="md"
                className="flex-1"
                onPress={handleConfirmDeleteAccount}
                loading={isDeletingAccount}
                disabled={isDeletingAccount}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
