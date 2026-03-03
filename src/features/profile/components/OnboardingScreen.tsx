import { useMemo, useState } from 'react';
import { Button, Card, Input, Screen } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useProfile } from '../ProfileContext';
import { equipmentOptions, experienceOptions, goalOptions } from '../types';
import { type ProfileValidationErrors } from '../validation';
import {
  ONBOARDING_STEPS,
  completeOnboarding,
  getOnboardingProgress,
  nextOnboardingStep,
  previousOnboardingStep,
} from '../onboardingFlow';

export const OnboardingScreen = () => {
  const theme = useTheme();
  const { draft, updateDraft, persistProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [saveMessage, setSaveMessage] = useState('');

  const progress = useMemo(() => getOnboardingProgress(step), [step]);

  const handleNext = async () => {
    if (step < ONBOARDING_STEPS.length - 1) {
      setStep((current) => nextOnboardingStep(current));
      return;
    }

    const completion = await completeOnboarding(draft, persistProfile);
    setErrors(completion.errors);

    if (!completion.ok) {
      return;
    }

    setSaveMessage(completion.message);
  };

  const handleBack = () => {
    if (step === 0) {
      return;
    }

    setStep((current) => previousOnboardingStep(current));
  };

  return (
    <Screen>
      <Card style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: theme.spacing.lg }}>
        <header style={{ display: 'grid', gap: theme.spacing.xs }}>
          <small style={{ color: theme.colors.text.tertiary }}>Onboarding {progress}%</small>
          <h1 style={{ margin: 0 }}>{ONBOARDING_STEPS[step]}</h1>
        </header>

        {step === 0 ? (
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <p style={{ margin: 0, color: theme.colors.text.secondary }}>
              Get stronger with training plans that adapt to your goals, schedule, and movement constraints.
            </p>
            <label style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>What should we call you?</strong>
              <Input
                value={draft.fullName}
                invalid={Boolean(errors.fullName)}
                onChange={(event) => updateDraft({ fullName: event.target.value })}
                placeholder="Your name"
              />
              {errors.fullName ? <small style={{ color: theme.colors.state.error }}>{errors.fullName}</small> : null}
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div style={{ display: 'grid', gap: theme.spacing.sm }}>
            {goalOptions.map((goal) => (
              <Button
                key={goal}
                variant={draft.goal === goal ? 'primary' : 'secondary'}
                style={{ justifyContent: 'flex-start', display: 'flex' }}
                onClick={() => updateDraft({ goal })}
              >
                {goal.replace('-', ' ')}
              </Button>
            ))}
            {errors.goal ? <small style={{ color: theme.colors.state.error }}>{errors.goal}</small> : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <div style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Experience level</strong>
              <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                {experienceOptions.map((level) => (
                  <Button
                    key={level}
                    variant={draft.experienceLevel === level ? 'primary' : 'secondary'}
                    onClick={() => updateDraft({ experienceLevel: level })}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              {errors.experienceLevel ? (
                <small style={{ color: theme.colors.state.error }}>{errors.experienceLevel}</small>
              ) : null}
            </div>

            <div style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Equipment</strong>
              <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                {equipmentOptions.map((equipment) => {
                  const active = draft.equipment.includes(equipment);

                  return (
                    <Button
                      key={equipment}
                      variant={active ? 'primary' : 'secondary'}
                      onClick={() => {
                        const nextEquipment = active
                          ? draft.equipment.filter((value) => value !== equipment)
                          : [...draft.equipment, equipment];

                        updateDraft({ equipment: nextEquipment });
                      }}
                    >
                      {equipment}
                    </Button>
                  );
                })}
              </div>
              {errors.equipment ? <small style={{ color: theme.colors.state.error }}>{errors.equipment}</small> : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <label style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Days per week</strong>
              <Input
                type="number"
                min={1}
                max={7}
                value={draft.daysPerWeek}
                invalid={Boolean(errors.daysPerWeek)}
                onChange={(event) => updateDraft({ daysPerWeek: Number(event.target.value) })}
              />
              {errors.daysPerWeek ? <small style={{ color: theme.colors.state.error }}>{errors.daysPerWeek}</small> : null}
            </label>

            <label style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Session duration (minutes)</strong>
              <Input
                type="number"
                min={15}
                max={180}
                step={5}
                value={draft.sessionDurationMinutes}
                invalid={Boolean(errors.sessionDurationMinutes)}
                onChange={(event) => updateDraft({ sessionDurationMinutes: Number(event.target.value) })}
              />
              {errors.sessionDurationMinutes ? (
                <small style={{ color: theme.colors.state.error }}>{errors.sessionDurationMinutes}</small>
              ) : null}
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div style={{ display: 'grid', gap: theme.spacing.md }}>
            <label style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Injuries or limitations</strong>
              <Input
                value={draft.injuries}
                maxLength={240}
                invalid={Boolean(errors.injuries)}
                placeholder="Optional"
                onChange={(event) => updateDraft({ injuries: event.target.value })}
              />
              {errors.injuries ? <small style={{ color: theme.colors.state.error }}>{errors.injuries}</small> : null}
            </label>

            <label style={{ display: 'grid', gap: theme.spacing.xs }}>
              <strong>Mobility constraints</strong>
              <Input
                value={draft.mobilityConstraints}
                maxLength={240}
                invalid={Boolean(errors.mobilityConstraints)}
                placeholder="Optional"
                onChange={(event) => updateDraft({ mobilityConstraints: event.target.value })}
              />
              {errors.mobilityConstraints ? (
                <small style={{ color: theme.colors.state.error }}>{errors.mobilityConstraints}</small>
              ) : null}
            </label>
          </div>
        ) : null}

        <footer style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'space-between' }}>
          <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
            Back
          </Button>
          <Button onClick={() => void handleNext()}>{step === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Continue'}</Button>
        </footer>

        {saveMessage ? <p style={{ color: theme.colors.state.success, margin: 0 }}>{saveMessage}</p> : null}
      </Card>
    </Screen>
  );
};
