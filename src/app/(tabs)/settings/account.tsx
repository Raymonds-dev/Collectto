import { useState } from 'react';
import { Modal, ScrollView, Text, TextInput, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface ProfileFormData {
  name: string;
  email: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountScreen() {
  const { user } = useAuth();
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleEditProfile = (): void => {
    // TODO: API call to update profile
    console.log('Profile updated:', profileData);
    setEditProfileVisible(false);
  };

  const handleChangePassword = (): void => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    // TODO: API call to change password
    console.log('Password changed');
    setChangePasswordVisible(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        {/* Profile Photo Section */}
        <View className="items-center py-6">
          <View className="h-24 w-24 rounded-full bg-brand-100" />
          <Text className="mt-4 text-xl font-semibold text-text-base">{user?.name}</Text>
          <Text className="mt-2 text-sm text-text-muted">{user?.email}</Text>
        </View>

        {/* Profile Information Card */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="text-lg font-semibold text-text-base">Dados Pessoais</Text>

          <View className="mt-4 space-y-3">
            <View>
              <Text className="text-sm font-medium text-text-subtle">Nome</Text>
              <Text className="mt-1 text-base text-text-base">{user?.name}</Text>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-text-subtle">E-mail</Text>
              <Text className="mt-1 text-base text-text-base">{user?.email}</Text>
            </View>
          </View>

          <Button
            label="Editar Perfil"
            variant="primary"
            size="md"
            className="mt-6"
            onPress={() => setEditProfileVisible(true)}
          />
        </View>

        {/* Security Section */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="text-lg font-semibold text-text-base">Segurança</Text>

          <Button
            label="Alterar Senha"
            variant="secondary"
            size="md"
            className="mt-4"
            onPress={() => setChangePasswordVisible(true)}
          />
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditProfileVisible(false)}>
        <View className="flex-1 bg-surface-base">
          <View className="flex-1 px-4 py-6">
            <Text className="text-2xl font-bold text-text-base">Editar Perfil</Text>

            <View className="mt-6 space-y-4">
              <View>
                <Text className="text-sm font-medium text-text-subtle">Nome Completo</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Seu nome"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text-subtle">E-mail</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="seu@email.com"
                  value={profileData.email}
                  onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                  editable={false}
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setEditProfileVisible(false)}
              />
              <Button
                label="Salvar"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleEditProfile}
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
            <Text className="text-2xl font-bold text-text-base">Alterar Senha</Text>

            <View className="mt-6 space-y-4">
              <View>
                <Text className="text-sm font-medium text-text-subtle">Senha Atual</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Digite sua senha atual"
                  secureTextEntry
                  value={passwordData.currentPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, currentPassword: text })
                  }
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text-subtle">Nova Senha</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Digite uma nova senha"
                  secureTextEntry
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text-subtle">Confirmar Senha</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Confirme sua nova senha"
                  secureTextEntry
                  value={passwordData.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordData({ ...passwordData, confirmPassword: text })
                  }
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
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
