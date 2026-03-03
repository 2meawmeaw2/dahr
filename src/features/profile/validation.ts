import type { ProfileDraft } from './types';

export type ProfileValidationErrors = Partial<Record<keyof ProfileDraft, string>>;

const MAX_TEXT_LENGTH = 240;

export const validateProfile = (draft: ProfileDraft): ProfileValidationErrors => {
  const errors: ProfileValidationErrors = {};

  if (!draft.fullName.trim()) {
    errors.fullName = 'Please provide your name.';
  }

  if (!draft.goal) {
    errors.goal = 'Select a primary goal.';
  }

  if (!draft.experienceLevel) {
    errors.experienceLevel = 'Select your experience level.';
  }

  if (!draft.equipment.length) {
    errors.equipment = 'Choose at least one equipment option.';
  }

  if (draft.daysPerWeek < 1 || draft.daysPerWeek > 7) {
    errors.daysPerWeek = 'Weekly availability must be between 1 and 7 days.';
  }

  if (draft.sessionDurationMinutes < 15 || draft.sessionDurationMinutes > 180) {
    errors.sessionDurationMinutes = 'Session duration must be between 15 and 180 minutes.';
  }

  if (draft.injuries.length > MAX_TEXT_LENGTH) {
    errors.injuries = `Injury notes cannot exceed ${MAX_TEXT_LENGTH} characters.`;
  }

  if (draft.mobilityConstraints.length > MAX_TEXT_LENGTH) {
    errors.mobilityConstraints = `Mobility notes cannot exceed ${MAX_TEXT_LENGTH} characters.`;
  }

  return errors;
};

export const hasValidationErrors = (errors: ProfileValidationErrors): boolean => Object.keys(errors).length > 0;
