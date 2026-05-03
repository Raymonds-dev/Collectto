import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SettingsItem, SettingsSection } from '@/components/settings';
import { Button } from '@/components/ui/Button';

export default function SupportScreen() {
  const router = useRouter();

  function handleFAQ() {
    // TODO(feature): Implementar tela de FAQ
    // router.push('/(tabs)/settings/support/faq');
  }

  function handleTerms() {
    // TODO(feature): Implementar tela de termos
    // router.push('/(tabs)/settings/support/terms');
  }

  function handlePrivacy() {
    // TODO(feature): Implementar tela de privacidade
    // router.push('/(tabs)/settings/support/privacy');
  }

  function handleFeedback() {
    // TODO(feature): Implementar formulário de feedback
    // router.push('/(tabs)/settings/support/feedback');
  }

  function handleReport() {
    // TODO(feature): Implementar formulário de reportar problema
    // router.push('/(tabs)/settings/support/report');
  }

  return (
    <ScrollView className="flex-1 bg-surface-base" contentContainerClassName="gap-4 px-4 py-6">
      <View>
        <Text className="font-body text-2xl font-bold text-text-base">Ajuda e Suporte</Text>
        <Text className="mt-2 text-sm text-text-muted">
          Encontre respostas e suporte para suas dúvidas
        </Text>
      </View>

      <SettingsSection  icon="help-circle" title="Informações" description="Documentação e FAQ">
        <SettingsItem
          label="Perguntas Frequentes"
          description="Respostas para dúvidas comuns"
          onPress={handleFAQ}
        />
        <SettingsItem
          label="Termos de Uso"
          description="Leia nossos termos"
          onPress={handleTerms}
        />
        <SettingsItem
          label="Política de Privacidade"
          description="Como protegemos seus dados"
          onPress={handlePrivacy}
        />
      </SettingsSection>

      <SettingsSection icon="mail" title="Contato" description="Envie-nos sua mensagem">
        <SettingsItem
          label="Enviar Feedback"
          description="Compartilhe suas sugestões"
          onPress={handleFeedback}
        />
        <SettingsItem
          label="Reportar Problema"
          description="Denuncie um bug ou problema"
          onPress={handleReport}
        />
      </SettingsSection>

      <Button label="Voltar" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}
