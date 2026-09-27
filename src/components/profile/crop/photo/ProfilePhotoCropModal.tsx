import type { ProfilePhotoCropModalProps } from './ProfilePhotoCropModal.native';
import { ProfilePhotoCropModal as DefaultModal } from './ProfilePhotoCropModal.native';

export type { ProfilePhotoCropModalProps };
/**
 * ProfilePhotoCropModal
 *
 * O que faz: Modal com máscara circular e gestos de pinça/arraste para recorte da foto de avatar do usuário, com suporte multiplataforma nativo e web.
 * Onde usar: Na tela de edição de conta (`src/app/(tabs)/settings/account.tsx`) ou ao atualizar o avatar do perfil.
 */
export const ProfilePhotoCropModal = DefaultModal;
export default ProfilePhotoCropModal;
