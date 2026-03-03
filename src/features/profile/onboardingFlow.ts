import { type ProfileDraft } from './types';
import { hasValidationErrors, validateProfile, type ProfileValidationErrors } from './validation';

export const ONBOARDING_STEPS = [
  'Welcome',
  'Your primary goal',
  'Experience and equipment',
  'Availability',
  'Injuries and mobility',
] as const;

export type OnboardingCompletionResult =
  | { ok: false; errors: ProfileValidationErrors }
  | { ok: true; message: string; errors: ProfileValidationErrors };

export const clampOnboardingStep = (step: number): number =>
  Math.min(Math.max(step, 0), ONBOARDING_STEPS.length - 1);

export const getOnboardingProgress = (step: number): number =>
  Math.round(((clampOnboardingStep(step) + 1) / ONBOARDING_STEPS.length) * 100);

export const nextOnboardingStep = (step: number): number =>
  clampOnboardingStep(step + 1);

export const previousOnboardingStep = (step: number): number =>
  clampOnboardingStep(step - 1);

export async function completeOnboarding(
  draft: ProfileDraft,
  persistProfile: (nextDraft: ProfileDraft) => Promise<unknown>,
): Promise<OnboardingCompletionResult> {
  const nextDraft = { ...draft, completedOnboarding: true };
  const errors = validateProfile(nextDraft);

  if (hasValidationErrors(errors)) {
    return { ok: false, errors };
  }

  await persistProfile(nextDraft);
  return {
    ok: true,
    message: 'Profile setup complete. Preferences saved.',
    errors: {},
  };
}
