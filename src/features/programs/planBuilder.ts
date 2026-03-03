import {
  type ExerciseBlock,
  type ExerciseOption,
  type IntensityMetric,
  type MovementCategory,
  type Program,
  type ProgramBuilderInput,
  type ProgressionMethod,
  type ProgressionRule,
  type Session,
  type SkillTrack,
  type TrainingWeek,
} from './models';

const skillLadders: Record<SkillTrack, string[]> = {
  'front-lever': ['tuck front lever hold', 'advanced tuck front lever hold', 'single leg front lever', 'straddle front lever'],
  planche: ['planche lean', 'tuck planche hold', 'advanced tuck planche hold', 'straddle planche'],
  handstand: ['wall handstand hold', 'wall handstand shoulder taps', 'freestanding handstand kick-up', 'freestanding handstand hold'],
  'muscle-up': ['band-assisted transition drill', 'chest-to-bar pull-up', 'straight-bar dip', 'strict muscle-up'],
};

type BlockTemplate = {
  category: MovementCategory;
  exercise: ExerciseOption;
  substitutions: ExerciseOption[];
  baseSets: number;
  repRange: [number, number];
  baseTempo?: string;
  progressionMethod: ProgressionMethod;
  notes?: string;
};

const blockTemplates: BlockTemplate[] = [
  {
    category: 'push',
    exercise: { name: 'push-up', requiredEquipment: [], contraindications: ['wrist-pain'] },
    substitutions: [
      { name: 'incline push-up', requiredEquipment: ['bench'] },
      { name: 'dumbbell floor press', requiredEquipment: ['dumbbells'] },
      { name: 'pike push-up', requiredEquipment: [] },
    ],
    baseSets: 4,
    repRange: [6, 12],
    progressionMethod: 'leverage-progression',
    notes: 'Leverage progression: incline -> standard -> pseudo planche push-up',
  },
  {
    category: 'pull',
    exercise: { name: 'pull-up', requiredEquipment: ['pullup-bar'], contraindications: ['elbow-tendinopathy'] },
    substitutions: [
      { name: 'band-assisted pull-up', requiredEquipment: ['pullup-bar', 'bands'] },
      { name: 'inverted row', requiredEquipment: ['rings'] },
      { name: 'single-arm dumbbell row', requiredEquipment: ['dumbbells'] },
    ],
    baseSets: 4,
    repRange: [5, 10],
    progressionMethod: 'reps-first',
  },
  {
    category: 'legs',
    exercise: { name: 'split squat', requiredEquipment: [], contraindications: ['knee-pain'] },
    substitutions: [
      { name: 'goblet squat', requiredEquipment: ['dumbbells'] },
      { name: 'reverse lunge', requiredEquipment: [] },
      { name: 'step-up', requiredEquipment: ['bench'] },
    ],
    baseSets: 4,
    repRange: [8, 14],
    progressionMethod: 'tempo-first',
    baseTempo: '2-0-2',
  },
  {
    category: 'core',
    exercise: { name: 'hollow body hold', requiredEquipment: [], contraindications: ['low-back-pain'] },
    substitutions: [
      { name: 'dead bug', requiredEquipment: [] },
      { name: 'plank', requiredEquipment: [] },
      { name: 'ab wheel rollout', requiredEquipment: ['ab-wheel'] },
    ],
    baseSets: 3,
    repRange: [20, 45],
    progressionMethod: 'reps-first',
  },
];

function progressionRules(totalWeeks: number): ProgressionRule[] {
  return [
    buildRule('reps-first', totalWeeks, 'Increase reps within range before adding load or harder variation.'),
    buildRule('tempo-first', totalWeeks, 'Slow eccentric and pause positions before increasing reps or load.'),
    buildRule('leverage-progression', totalWeeks, 'Advance body angle or lever: incline -> standard -> pseudo planche progressions.'),
    buildRule('skill-ladder', totalWeeks, 'Climb technical ladder only when quality threshold is met for all current steps.'),
  ];
}

function buildRule(method: ProgressionMethod, totalWeeks: number, description: string): ProgressionRule {
  const applyByWeek: Record<number, IntensityMetric> = {};
  for (let week = 1; week <= totalWeeks; week += 1) {
    const deload = week % 4 === 0;
    const growthStep = Math.floor((week - 1) / 4);
    const progressiveOffset = (week - 1) % 4;

    applyByWeek[week] = {
      rpeTarget: deload ? 6 : Math.min(8.5, 6.5 + growthStep * 0.4 + progressiveOffset * 0.4),
      loadFactor: deload ? 0.85 : 1 + growthStep * 0.05 + progressiveOffset * 0.025,
      volumeMultiplier: deload ? 0.65 : 1 + growthStep * 0.05 + progressiveOffset * 0.05,
      deload,
    };
  }

  return {
    id: method,
    name: method,
    method,
    description,
    applyByWeek,
    deloadWeekFrequency: 4,
  };
}

function pickExercise(template: BlockTemplate, availableEquipment: string[], injuries: string[]): ExerciseOption {
  const canUse = (exercise: ExerciseOption) =>
    exercise.requiredEquipment.every((item) => availableEquipment.includes(item)) &&
    !(exercise.contraindications ?? []).some((injury) => injuries.includes(injury));

  if (canUse(template.exercise)) {
    return template.exercise;
  }

  return template.substitutions.find(canUse) ?? template.exercise;
}

function deriveRepPrescription(template: BlockTemplate, weekIntensity: IntensityMetric): { reps: string; tempo?: string } {
  const [min, max] = template.repRange;

  if (template.progressionMethod === 'tempo-first') {
    if (weekIntensity.deload) {
      return { reps: `${min}-${min + 2}`, tempo: '2-0-2' };
    }
    const tempo = weekIntensity.rpeTarget > 7.5 ? '4-1-2' : '3-1-2';
    return { reps: `${min}-${max - 2}`, tempo };
  }

  if (template.progressionMethod === 'reps-first') {
    const top = weekIntensity.deload ? max - 3 : max;
    const bottom = weekIntensity.deload ? min : min + 1;
    return { reps: `${bottom}-${top}` };
  }

  if (template.progressionMethod === 'leverage-progression') {
    return {
      reps: weekIntensity.deload ? `${min}-${min + 1}` : `${min}-${max - 1}`,
      tempo: weekIntensity.deload ? '2-0-1' : '3-0-1',
    };
  }

  return { reps: `${min}-${max}` };
}

function buildSessionBlocks(
  week: number,
  sessionIndex: number,
  availableEquipment: string[],
  injuries: string[],
  rules: ProgressionRule[],
): ExerciseBlock[] {
  const weekIntensity = rules[0].applyByWeek[week];

  return blockTemplates.map((template, blockIndex) => {
    const chosenExercise = pickExercise(template, availableEquipment, injuries);
    const prescription = deriveRepPrescription(template, weekIntensity);
    const rule = rules.find((candidate) => candidate.method === template.progressionMethod);

    return {
      id: `w${week}-s${sessionIndex}-b${blockIndex}`,
      category: template.category,
      exercise: chosenExercise,
      substitutions: template.substitutions,
      sets: Math.max(2, Math.round(template.baseSets * weekIntensity.volumeMultiplier * (weekIntensity.deload ? 0.7 : 1))),
      reps: prescription.reps,
      tempo: prescription.tempo ?? template.baseTempo,
      progressionRuleId: rule?.id ?? 'reps-first',
      notes: template.notes,
    };
  });
}

function buildSkillBlock(
  week: number,
  sessionIndex: number,
  track: SkillTrack,
  rules: ProgressionRule[],
): ExerciseBlock {
  const rule = rules.find((candidate) => candidate.method === 'skill-ladder');
  const ladder = skillLadders[track];
  const rung = Math.min(ladder.length - 1, Math.floor((week - 1) / 2));

  return {
    id: `w${week}-s${sessionIndex}-skill-${track}`,
    category: 'skill',
    exercise: { name: ladder[rung], requiredEquipment: [] },
    substitutions: ladder.map((name) => ({ name, requiredEquipment: [] })),
    sets: week % 4 === 0 ? 2 : 4,
    reps: week % 4 === 0 ? '2 x 20-30s quality practice' : '4 x 20-40s or 3-5 clean reps',
    progressionRuleId: rule?.id ?? 'skill-ladder',
    notes: `${track} ladder step ${rung + 1}/${ladder.length}`,
  };
}

function buildSession(
  week: number,
  sessionIndex: number,
  sessionsPerWeek: number,
  availableEquipment: string[],
  injuries: string[],
  preferredSkill: SkillTrack,
  rules: ProgressionRule[],
): Session {
  const baseBlocks = buildSessionBlocks(week, sessionIndex, availableEquipment, injuries, rules);
  const includeSkill = sessionIndex % Math.max(1, Math.floor(sessionsPerWeek / 2)) === 0;

  if (includeSkill) {
    baseBlocks.push(buildSkillBlock(week, sessionIndex, preferredSkill, rules));
  }

  return {
    id: `w${week}-s${sessionIndex}`,
    name: `Session ${sessionIndex + 1}`,
    dayOfWeek: (sessionIndex % 7) + 1,
    focus: ['push', 'pull', 'legs', 'core', ...(includeSkill ? (['skill'] as const) : [])],
    blocks: baseBlocks,
  };
}

export function buildProgram(input: ProgramBuilderInput): Program {
  const rules = progressionRules(input.totalWeeks);
  const preferredSkill = input.preferredSkills?.[0] ?? 'handstand';

  const weeks: TrainingWeek[] = Array.from({ length: input.totalWeeks }, (_, index) => {
    const weekNumber = index + 1;
    const intensity = rules[0].applyByWeek[weekNumber];

    const sessions = Array.from({ length: input.sessionsPerWeek }, (_, sessionIndex) =>
      buildSession(
        weekNumber,
        sessionIndex,
        input.sessionsPerWeek,
        input.availableEquipment,
        input.injuries,
        preferredSkill,
        rules,
      ),
    );

    return {
      weekNumber,
      deload: intensity.deload,
      intensity,
      sessions,
    };
  });

  return {
    id: input.id ?? `program-${Date.now()}`,
    name: input.name,
    weeks,
    progressionRules: rules,
    skillLadders,
    constraints: {
      availableEquipment: input.availableEquipment,
      injuries: input.injuries,
    },
  };
}
