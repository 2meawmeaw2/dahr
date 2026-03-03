export { ProfileProvider, useProfile } from './ProfileContext';
export { OnboardingScreen } from './components/OnboardingScreen';
export { ProfileEditScreen } from './components/ProfileEditScreen';
export {
  defaultProfileDraft,
  equipmentOptions,
  experienceOptions,
  goalOptions,
  type EquipmentType,
  type ExperienceLevel,
  type GoalType,
  type ProfileData,
  type ProfileDraft,
} from './types';
export { buildProfileData, getLocalProfile, loadProfile, saveLocalProfile, saveProfile, type ProfileBackendAdapter } from './storage';
export { hasValidationErrors, validateProfile, type ProfileValidationErrors } from './validation';
