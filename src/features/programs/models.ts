export type MovementCategory = 'push' | 'pull' | 'legs' | 'core' | 'skill';

export type ProgressionMethod =
  | 'reps-first'
  | 'tempo-first'
  | 'leverage-progression'
  | 'skill-ladder';

export type SkillTrack = 'front-lever' | 'planche' | 'handstand' | 'muscle-up';

export type IntensityMetric = {
  rpeTarget: number;
  loadFactor: number;
  volumeMultiplier: number;
  deload: boolean;
};

export type ProgressionRule = {
  id: string;
  name: string;
  method: ProgressionMethod;
  description: string;
  applyByWeek: Record<number, IntensityMetric>;
  deloadWeekFrequency: number;
};

export type ExerciseOption = {
  name: string;
  requiredEquipment: string[];
  contraindications?: string[];
};

export type ExerciseBlock = {
  id: string;
  category: MovementCategory;
  exercise: ExerciseOption;
  substitutions: ExerciseOption[];
  sets: number;
  reps: string;
  tempo?: string;
  progressionRuleId: string;
  notes?: string;
};

export type Session = {
  id: string;
  name: string;
  dayOfWeek: number;
  focus: MovementCategory[];
  blocks: ExerciseBlock[];
};

export type TrainingWeek = {
  weekNumber: number;
  deload: boolean;
  intensity: IntensityMetric;
  sessions: Session[];
};

export type Program = {
  id: string;
  name: string;
  weeks: TrainingWeek[];
  progressionRules: ProgressionRule[];
  skillLadders: Record<SkillTrack, string[]>;
  constraints: {
    availableEquipment: string[];
    injuries: string[];
  };
};

export type ProgramBuilderInput = {
  id?: string;
  name: string;
  totalWeeks: number;
  sessionsPerWeek: number;
  availableEquipment: string[];
  injuries: string[];
  preferredSkills?: SkillTrack[];
};
