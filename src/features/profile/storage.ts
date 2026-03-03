import { defaultProfileDraft, type ProfileData, type ProfileDraft } from './types';

const PROFILE_STORAGE_KEY = 'dahr:user-profile';

export type ProfileBackendAdapter = {
  loadProfile: () => Promise<ProfileData | null>;
  saveProfile: (profile: ProfileData) => Promise<void>;
};

const canUseLocalStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const parseStoredProfile = (raw: string | null): ProfileData | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ProfileData;

    if (typeof parsed !== 'object' || !parsed || !parsed.updatedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const getLocalProfile = (): ProfileData | null => {
  if (!canUseLocalStorage()) {
    return null;
  }

  return parseStoredProfile(window.localStorage.getItem(PROFILE_STORAGE_KEY));
};

export const saveLocalProfile = (profile: ProfileData): void => {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const buildProfileData = (draft: ProfileDraft): ProfileData => ({
  ...draft,
  updatedAt: new Date().toISOString(),
});

export const loadProfile = async (adapter?: ProfileBackendAdapter): Promise<ProfileData | null> => {
  const local = getLocalProfile();

  if (adapter) {
    const backendProfile = await adapter.loadProfile();

    if (backendProfile) {
      saveLocalProfile(backendProfile);
      return backendProfile;
    }
  }

  return local;
};

export const saveProfile = async (draft: ProfileDraft, adapter?: ProfileBackendAdapter): Promise<ProfileData> => {
  const profile = buildProfileData(draft);

  saveLocalProfile(profile);

  if (adapter) {
    await adapter.saveProfile(profile);
  }

  return profile;
};

export const getInitialDraft = (profile: ProfileData | null): ProfileDraft => {
  if (!profile) {
    return defaultProfileDraft;
  }

  const { updatedAt: _updatedAt, ...draft } = profile;
  return draft;
};
