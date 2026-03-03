import { useMemo, useState } from 'react';
import { Button, Card, Screen } from '../../../components/ui';
import { useTheme } from '../../../theme';
import { useProfile } from '../ProfileContext';
import { equipmentOptions, experienceOptions, goalOptions } from '../types';
import { hasValidationErrors, validateProfile, type ProfileValidationErrors } from '../validation';
import { ProfileFormFields } from './ProfileFormFields';

export const ProfileEditScreen = () => {
  const theme = useTheme();
  const { draft, setDraft, persistProfile } = useProfile();
  const [errors, setErrors] = useState<ProfileValidationErrors>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const formTitle = useMemo(() => (draft.fullName ? `${draft.fullName}'s profile` : 'Edit profile'), [draft.fullName]);

  const onSave = async () => {
    const validation = validateProfile(draft);
    setErrors(validation);

    if (hasValidationErrors(validation)) {
      return;
    }

    setStatus('saving');
    await persistProfile({ ...draft, completedOnboarding: true });
    setStatus('saved');
  };

  return (
    <Screen>
      <Card style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gap: theme.spacing.lg }}>
        <header style={{ display: 'grid', gap: theme.spacing.xs }}>
          <h1 style={{ margin: 0 }}>{formTitle}</h1>
          <p style={{ margin: 0, color: theme.colors.text.secondary }}>
            Update your training preferences. We validate critical fields before saving.
          </p>
        </header>

        <ProfileFormFields
          draft={draft}
          errors={errors}
          onDraftChange={(updates) => setDraft({ ...draft, ...updates })}
          goalOptions={goalOptions}
          experienceOptions={experienceOptions}
          equipmentOptions={equipmentOptions}
        />

        <footer style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Button onClick={() => void onSave()} disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save profile'}
          </Button>
          {status === 'saved' ? <small style={{ color: theme.colors.state.success }}>Profile saved successfully.</small> : null}
        </footer>
      </Card>
    </Screen>
  );
};
