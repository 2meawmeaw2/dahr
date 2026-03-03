export type RangeFilter = '7d' | '30d' | '90d' | 'all-time';

export type WorkoutLog = {
  date: string;
  completed: number;
  planned: number;
  volume: number;
};

export type StrengthEstimatePoint = {
  date: string;
  movement: 'Pull' | 'Push' | 'Legs';
  estimate: number;
};

export type SkillMilestone = {
  skill: string;
  stage: string;
  date: string;
  confidence: number;
};

export type MovementPatternPr = {
  pattern: 'Vertical Pull' | 'Horizontal Push' | 'Squat';
  maxReps: number;
  hardestProgression: string;
  weightedVariationKg: number;
};

export const rangeDays: Record<RangeFilter, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  'all-time': Number.POSITIVE_INFINITY,
};

const now = new Date('2026-03-03T12:00:00Z');

function isoDaysAgo(daysAgo: number) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export const workoutLogs: WorkoutLog[] = [
  { date: isoDaysAgo(2), completed: 6, planned: 6, volume: 7400 },
  { date: isoDaysAgo(4), completed: 5, planned: 6, volume: 6800 },
  { date: isoDaysAgo(7), completed: 6, planned: 7, volume: 8120 },
  { date: isoDaysAgo(10), completed: 7, planned: 7, volume: 9050 },
  { date: isoDaysAgo(14), completed: 4, planned: 6, volume: 5600 },
  { date: isoDaysAgo(18), completed: 6, planned: 6, volume: 8600 },
  { date: isoDaysAgo(22), completed: 5, planned: 6, volume: 7350 },
  { date: isoDaysAgo(27), completed: 6, planned: 6, volume: 8830 },
  { date: isoDaysAgo(34), completed: 4, planned: 6, volume: 5900 },
  { date: isoDaysAgo(41), completed: 6, planned: 7, volume: 8050 },
  { date: isoDaysAgo(50), completed: 6, planned: 6, volume: 9100 },
  { date: isoDaysAgo(61), completed: 5, planned: 6, volume: 7700 },
  { date: isoDaysAgo(72), completed: 7, planned: 7, volume: 9750 },
  { date: isoDaysAgo(84), completed: 6, planned: 7, volume: 8220 },
  { date: isoDaysAgo(101), completed: 5, planned: 7, volume: 7000 },
  { date: isoDaysAgo(126), completed: 4, planned: 6, volume: 5500 },
];

export const strengthEstimatePoints: StrengthEstimatePoint[] = [
  { date: isoDaysAgo(120), movement: 'Pull', estimate: 67 },
  { date: isoDaysAgo(90), movement: 'Pull', estimate: 71 },
  { date: isoDaysAgo(60), movement: 'Pull', estimate: 75 },
  { date: isoDaysAgo(30), movement: 'Pull', estimate: 81 },
  { date: isoDaysAgo(0), movement: 'Pull', estimate: 85 },
  { date: isoDaysAgo(120), movement: 'Push', estimate: 54 },
  { date: isoDaysAgo(90), movement: 'Push', estimate: 56 },
  { date: isoDaysAgo(60), movement: 'Push', estimate: 60 },
  { date: isoDaysAgo(30), movement: 'Push', estimate: 63 },
  { date: isoDaysAgo(0), movement: 'Push', estimate: 66 },
  { date: isoDaysAgo(120), movement: 'Legs', estimate: 93 },
  { date: isoDaysAgo(90), movement: 'Legs', estimate: 98 },
  { date: isoDaysAgo(60), movement: 'Legs', estimate: 104 },
  { date: isoDaysAgo(30), movement: 'Legs', estimate: 111 },
  { date: isoDaysAgo(0), movement: 'Legs', estimate: 118 },
];

export const milestones: SkillMilestone[] = [
  { skill: 'Handstand Hold', stage: '30s wall hold', date: isoDaysAgo(74), confidence: 0.7 },
  { skill: 'Handstand Hold', stage: '5s freestanding', date: isoDaysAgo(19), confidence: 0.52 },
  { skill: 'Muscle-Up', stage: 'Band-assisted rep', date: isoDaysAgo(56), confidence: 0.64 },
  { skill: 'Muscle-Up', stage: 'First strict rep', date: isoDaysAgo(8), confidence: 0.41 },
  { skill: 'Pistol Squat', stage: 'Tempo single', date: isoDaysAgo(37), confidence: 0.68 },
];

export const movementPatternPrs: MovementPatternPr[] = [
  {
    pattern: 'Vertical Pull',
    maxReps: 14,
    hardestProgression: 'L-Sit Pull-Up',
    weightedVariationKg: 18,
  },
  {
    pattern: 'Horizontal Push',
    maxReps: 28,
    hardestProgression: 'Ring Archer Push-Up',
    weightedVariationKg: 24,
  },
  { pattern: 'Squat', maxReps: 22, hardestProgression: 'Shrimp Squat', weightedVariationKg: 32 },
];
