import { describe, expect, it, vi } from 'vitest';

import { defaultProfileDraft } from './types';
import {
  completeOnboarding,
  getOnboardingProgress,
  nextOnboardingStep,
  previousOnboardingStep,
} from './onboardingFlow';

describe('onboarding UI flow helpers', () => {
  it('moves forward/back while clamping step range', () => {
    expect(nextOnboardingStep(0)).toBe(1);
    expect(previousOnboardingStep(0)).toBe(0);
    expect(nextOnboardingStep(99)).toBe(4);
    expect(getOnboardingProgress(0)).toBe(20);
    expect(getOnboardingProgress(4)).toBe(100);
  });

  it('persists profile when completion is valid', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);
    const draft = { ...defaultProfileDraft, fullName: 'Taylor' };

    const result = await completeOnboarding(draft, persist);

    expect(result.ok).toBe(true);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ message: 'Profile setup complete. Preferences saved.' });
  });

  it('returns validation errors when completion is invalid', async () => {
    const persist = vi.fn().mockResolvedValue(undefined);

    const result = await completeOnboarding(defaultProfileDraft, persist);

    expect(result.ok).toBe(false);
    expect(persist).not.toHaveBeenCalled();
    expect(result.errors.fullName).toBe('Please provide your name.');
  });
});
