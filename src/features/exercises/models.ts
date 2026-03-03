export type MovementCategory =
  | 'push-up'
  | 'dip'
  | 'pull-up/chin-up'
  | 'row'
  | 'squat/lunge'
  | 'hinge'
  | 'core anti-extension/rotation'
  | 'skill';

export type SkillTag =
  | 'handstand'
  | 'front lever'
  | 'back lever'
  | 'planche'
  | 'muscle-up'
  | 'L-sit';

export type StrengthTag = 'upper body push' | 'upper body pull' | 'lower body' | 'core';
export type MobilityTag = 'wrist' | 'shoulder' | 'thoracic spine' | 'hip' | 'ankle' | 'hamstring';
export type EquipmentTag = 'bodyweight' | 'rings' | 'barbell' | 'pull-up bar' | 'parallettes' | 'bench';
export type LevelTag = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseTagGroup = {
  skill: SkillTag[];
  strength: StrengthTag[];
  mobility: MobilityTag[];
  equipment: EquipmentTag[];
  level: LevelTag;
};

export type Exercise = {
  id: string;
  name: string;
  category: MovementCategory;
  summary: string;
  tags: ExerciseTagGroup;
  progression: {
    regression: string;
    base: string;
    progression: string;
  };
  contraindications: string[];
  commonFaults: string[];
};
