import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/Button';

interface FeedbackFormData {
  subject: string;
  message: string;
}

interface ReportFormData {
  issueType: string;
  description: string;
}

export default function HelpScreen() {
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackFormData>({
    subject: '',
    message: '',
  });
  const [reportData, setReportData] = useState<ReportFormData>({
    issueType: '',
    description: '',
  });

  const handleSendFeedback = (): void => {
    // TODO: API call to send feedback
    console.log('Feedback sent:', feedbackData);
    setFeedbackModalVisible(false);
    setFeedbackData({ subject: '', message: '' });
  };

  const handleSendReport = (): void => {
    // TODO: API call to send report
    console.log('Report sent:', reportData);
    setReportModalVisible(false);
    setReportData({ issueType: '', description: '' });
  };

  const HelpLink = ({
    icon,
    title,
    subtitle,
  }: {
    icon: string;
    title: string;
    subtitle: string;
  }): React.ReactElement => (
    <Pressable className="flex-row items-center rounded-lg border border-surface-border bg-surface-card px-4 py-3">
      <Ionicons name={icon as any} size={24} color="#FE5E00" />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-text-base">{title}</Text>
        <Text className="mt-1 text-xs text-text-muted">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#A4A3A3" />
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-surface-base">
      <View className="space-y-4 px-4 py-6">
        {/* FAQ Section */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="text-lg font-semibold text-text-base">Perguntas Frequentes</Text>
          <Text className="mt-2 text-sm text-text-muted">
            Encontre respostas para as dúvidas mais comuns.
          </Text>

          <Pressable className="mt-4 flex-row items-center justify-between">
            <Text className="text-base text-brand-primary">Acessar FAQ</Text>
            <Ionicons name="open-outline" size={20} color="#FE5E00" />
          </Pressable>
        </View>

        {/* Documentation Links */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="mb-4 text-lg font-semibold text-text-base">Documentação</Text>

          <View className="space-y-3">
            <HelpLink
              icon="document-text-outline"
              title="Termos de Serviço"
              subtitle="Leia nossos termos e condições"
            />
            <HelpLink
              icon="shield-outline"
              title="Política de Privacidade"
              subtitle="Saiba como seus dados são tratados"
            />
            <HelpLink
              icon="information-circle-outline"
              title="Sobre o Collectto"
              subtitle="Conheça mais sobre nosso projeto"
            />
          </View>
        </View>

        {/* Support Actions */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="mb-4 text-lg font-semibold text-text-base">Suporte</Text>

          <View className="space-y-3">
            <Button
              label="Enviar Feedback"
              variant="secondary"
              size="md"
              leftIcon={<Ionicons name="chatbubble-outline" size={20} color="#FE5E00" />}
              onPress={() => setFeedbackModalVisible(true)}
            />
            <Button
              label="Reportar Problema"
              variant="secondary"
              size="md"
              leftIcon={<Ionicons name="alert-circle-outline" size={20} color="#FE5E00" />}
              onPress={() => setReportModalVisible(true)}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View className="rounded-2xl border border-surface-border bg-surface-card p-4">
          <Text className="text-lg font-semibold text-text-base">Entre em Contato</Text>
          <Text className="mt-2 text-sm text-text-muted">E-mail: support@collectto.com</Text>
        </View>
      </View>

      {/* Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFeedbackModalVisible(false)}>
        <View className="flex-1 bg-surface-base">
          <View className="flex-1 px-4 py-6">
            <Text className="text-2xl font-bold text-text-base">Enviar Feedback</Text>

            <View className="mt-6 space-y-4">
              <View>
                <Text className="text-sm font-medium text-text-subtle">Assunto</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Qual é o assunto do seu feedback?"
                  value={feedbackData.subject}
                  onChangeText={(text) => setFeedbackData({ ...feedbackData, subject: text })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text-subtle">Mensagem</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Compartilhe seu feedback..."
                  multiline
                  numberOfLines={5}
                  value={feedbackData.message}
                  onChangeText={(text) => setFeedbackData({ ...feedbackData, message: text })}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setFeedbackModalVisible(false)}
              />
              <Button
                label="Enviar"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleSendFeedback}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReportModalVisible(false)}>
        <View className="flex-1 bg-surface-base">
          <View className="flex-1 px-4 py-6">
            <Text className="text-2xl font-bold text-text-base">Reportar Problema</Text>

            <View className="mt-6 space-y-4">
              <View>
                <Text className="text-sm font-medium text-text-subtle">Tipo de Problema</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Ex: Bug, Erro de Carregamento, etc."
                  value={reportData.issueType}
                  onChangeText={(text) => setReportData({ ...reportData, issueType: text })}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-text-subtle">Descrição</Text>
                <TextInput
                  className="mt-2 rounded-lg border border-surface-border bg-surface-card px-4 py-3 text-text-base"
                  placeholder="Descreva o problema em detalhes..."
                  multiline
                  numberOfLines={5}
                  value={reportData.description}
                  onChangeText={(text) => setReportData({ ...reportData, description: text })}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View className="mt-6 flex-row gap-3">
              <Button
                label="Cancelar"
                variant="ghost"
                size="md"
                className="flex-1"
                onPress={() => setReportModalVisible(false)}
              />
              <Button
                label="Enviar"
                variant="primary"
                size="md"
                className="flex-1"
                onPress={handleSendReport}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
