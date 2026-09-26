import type { ProfileBackgroundCropModalProps } from './ProfileBackgroundCropModal.native';
import { ProfileBackgroundCropModal as DefaultModal } from './ProfileBackgroundCropModal.native';

export type { ProfileBackgroundCropModalProps };
/**
 * ProfileBackgroundCropModal
 *
 * O que faz: Modal com interface de corte interativo na proporção 16:9 para foto de capa do perfil, com suporte multiplataforma (gestos nativos no mobile e HTML5 Canvas na web).
 * Onde usar: Na tela de perfil (`src/app/(tabs)/profile.tsx`) ao selecionar uma nova foto de banner.
 */
export const ProfileBackgroundCropModal = DefaultModal;
export default ProfileBackgroundCropModal;
