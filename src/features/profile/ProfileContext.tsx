import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { defaultProfileDraft, type ProfileData, type ProfileDraft } from './types';
import { getInitialDraft, loadProfile, saveProfile, type ProfileBackendAdapter } from './storage';

type ProfileContextValue = {
  profile: ProfileData | null;
  draft: ProfileDraft;
  loading: boolean;
  setDraft: (nextDraft: ProfileDraft) => void;
  updateDraft: (updates: Partial<ProfileDraft>) => void;
  persistProfile: (nextDraft: ProfileDraft) => Promise<ProfileData>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

type ProfileProviderProps = PropsWithChildren<{
  backendAdapter?: ProfileBackendAdapter;
}>;

export const ProfileProvider = ({ children, backendAdapter }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(defaultProfileDraft);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const loadedProfile = await loadProfile(backendAdapter);

      if (!mounted) {
        return;
      }

      setProfile(loadedProfile);
      setDraft(getInitialDraft(loadedProfile));
      setLoading(false);
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [backendAdapter]);

  const updateDraft = (updates: Partial<ProfileDraft>) => setDraft((current) => ({ ...current, ...updates }));

  const persistProfile = async (nextDraft: ProfileDraft) => {
    const saved = await saveProfile(nextDraft, backendAdapter);
    setProfile(saved);
    setDraft(getInitialDraft(saved));

    return saved;
  };

  const value = useMemo(
    () => ({ profile, draft, loading, setDraft, updateDraft, persistProfile }),
    [profile, draft, loading],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error('useProfile must be used inside a ProfileProvider');
  }

  return context;
};
