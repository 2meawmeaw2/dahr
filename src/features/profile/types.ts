export type GoalType = 'strength' | 'skill' | 'hypertrophy' | 'endurance' | 'recomposition';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type EquipmentType =
  | 'bodyweight'
  | 'dumbbells'
  | 'barbell'
  | 'bands'
  | 'machines'
  | 'kettlebells'
  | 'full-gym';

export type ProfileData = {
  fullName: string;
  goal: GoalType;
  experienceLevel: ExperienceLevel;
  equipment: EquipmentType[];
  daysPerWeek: number;
  sessionDurationMinutes: number;
  injuries: string;
  mobilityConstraints: string;
  completedOnboarding: boolean;
  updatedAt: string;
};

export type ProfileDraft = Omit<ProfileData, 'updatedAt'>;

export const goalOptions: GoalType[] = ['strength', 'skill', 'hypertrophy', 'endurance', 'recomposition'];

export const experienceOptions: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

export const equipmentOptions: EquipmentType[] = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'bands',
  'machines',
  'kettlebells',
  'full-gym',
];

export const defaultProfileDraft: ProfileDraft = {
  fullName: '',
  goal: 'strength',
  experienceLevel: 'beginner',
  equipment: ['bodyweight'],
  daysPerWeek: 3,
  sessionDurationMinutes: 45,
  injuries: '',
  mobilityConstraints: '',
  completedOnboarding: false,
};
