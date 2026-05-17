import { SettingsSectionConfig } from '@/types/settings';

export const SETTINGS_ACCOUNT: SettingsSectionConfig = {
  title: 'Conta e Perfil',
  description: 'Gerencie suas informações pessoais e segurança da conta',
  icon: 'person',
  items: [
    {
      id: 'edit-profile',
      label: 'Editar Perfil',
      description: 'Foto, nome e informações pessoais',
      action: 'edit-profile',
    },
    {
      id: 'change-password',
      label: 'Trocar Senha',
      description: 'Atualize sua senha com segurança',
      action: 'change-password',
    },
    {
      id: 'view-data',
      label: 'Dados da Conta',
      description: 'Visualize e baixe seus dados',
      action: 'view-data',
    },
  ],
};

export const SETTINGS_SUPPORT: SettingsSectionConfig = {
  title: 'Ajuda e Suporte',
  description: 'Encontre respostas e suporte',
  icon: 'help-circle',
  items: [
    {
      id: 'faq',
      label: 'Perguntas Frequentes',
      description: 'Respostas para dúvidas comuns',
      action: 'faq',
    },
    {
      id: 'terms',
      label: 'Termos de Uso',
      description: 'Leia nossos termos',
      action: 'terms',
    },
    {
      id: 'privacy',
      label: 'Política de Privacidade',
      description: 'Como protegemos seus dados',
      action: 'privacy',
    },
    {
      id: 'feedback',
      label: 'Enviar Feedback',
      description: 'Compartilhe suas sugestões',
      action: 'feedback',
    },
    {
      id: 'report',
      label: 'Reportar Problema',
      description: 'Denuncie um bug ou problema',
      action: 'report',
    },
  ],
};

export const SETTINGS_SECURITY: SettingsSectionConfig = {
  title: 'Sessão e Segurança',
  description: 'Controle total da sua conta',
  icon: 'lock-closed',
  items: [
    {
      id: 'sign-out',
      label: 'Sair da Conta',
      description: 'Encerre esta sessão',
      action: 'sign-out',
      isDangerous: true,
    },
    {
      id: 'delete-account',
      label: 'Excluir Conta',
      description: 'Deletar permanentemente sua conta',
      action: 'delete-account',
      isDangerous: true,
    },
  ],
};

export const SETTINGS_SECTIONS_METADATA = [
  { id: 'account', config: SETTINGS_ACCOUNT },
  { id: 'support', config: SETTINGS_SUPPORT },
  { id: 'security', config: SETTINGS_SECURITY },
];

// TODO(api): Substituir por dados reais quando API estiver disponível
export const FAQ_ITEMS = [
  {
    question: 'Como faço para criar uma coleção?',
    answer: 'Visite a aba Perfil e clique em "Criar Coleção".',
  },
  {
    question: 'Posso deletar itens após adicionar?',
    answer: 'Sim, abra a coleção e deslize sobre o item para deletá-lo.',
  },
  {
    question: 'Como compartilho minha coleção?',
    answer: 'Vá para a coleção e toque no ícone de compartilhamento.',
  },
];

// TODO(api): Textos de termos e privacidade virão da API no futuro
export const TERMS_TEXT =
  'Nossos Termos de Uso definem as regras para usar o Collectto. Ao usar este aplicativo, você concorda com todos os termos aqui descritos.';

export const PRIVACY_TEXT =
  'Sua privacidade é importante. Leia como coletamos, usamos e protegemos seus dados pessoais.';
