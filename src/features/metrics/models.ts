export type BodyweightEntry = {
  date: string;
  weightKg: number;
};

export type BodyMeasurementsEntry = {
  date: string;
  waistCm: number;
  chestCm: number;
  armCm: number;
};

export type ProgressPhotoMetadata = {
  id: string;
  date: string;
  angle: 'front' | 'side' | 'back';
  lighting: 'natural' | 'indoor' | 'gym';
  locationHint: string;
  notes?: string;
  uri?: string;
};

export type BodyweightTrend = {
  deltaKg: number;
  weeklyRateKg: number;
};

export type MeasurementChanges = {
  waistCm: number;
  chestCm: number;
  armCm: number;
};

const now = new Date('2026-03-03T12:00:00Z');

function isoDaysAgo(daysAgo: number) {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  const fromMs = new Date(from).getTime();
  const toMs = new Date(to).getTime();
  const days = Math.max(1, Math.round((toMs - fromMs) / (1000 * 60 * 60 * 24)));
  return days;
}

export const bodyweightEntries: BodyweightEntry[] = [
  { date: isoDaysAgo(84), weightKg: 77.2 },
  { date: isoDaysAgo(70), weightKg: 76.8 },
  { date: isoDaysAgo(56), weightKg: 76.1 },
  { date: isoDaysAgo(42), weightKg: 75.6 },
  { date: isoDaysAgo(28), weightKg: 75.2 },
  { date: isoDaysAgo(14), weightKg: 74.8 },
  { date: isoDaysAgo(0), weightKg: 74.3 },
];

export const bodyMeasurementEntries: BodyMeasurementsEntry[] = [
  { date: isoDaysAgo(84), waistCm: 84.2, chestCm: 102.3, armCm: 36.4 },
  { date: isoDaysAgo(56), waistCm: 82.8, chestCm: 102.5, armCm: 36.7 },
  { date: isoDaysAgo(28), waistCm: 81.6, chestCm: 102.8, armCm: 37.1 },
  { date: isoDaysAgo(0), waistCm: 80.5, chestCm: 103.1, armCm: 37.4 },
];

export const progressPhotoMetadataPlaceholders: ProgressPhotoMetadata[] = [
  {
    id: 'week-12-front',
    date: isoDaysAgo(84),
    angle: 'front',
    lighting: 'natural',
    locationHint: 'Bedroom mirror',
  },
  {
    id: 'week-8-side',
    date: isoDaysAgo(56),
    angle: 'side',
    lighting: 'indoor',
    locationHint: 'Gym changing area',
    notes: 'Same morning timing as baseline.',
  },
  {
    id: 'week-0-back',
    date: isoDaysAgo(0),
    angle: 'back',
    lighting: 'natural',
    locationHint: 'Bedroom mirror',
  },
];

export function calculateBodyweightTrend(entries: BodyweightEntry[]): BodyweightTrend {
  if (entries.length < 2) {
    return { deltaKg: 0, weeklyRateKg: 0 };
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const first = sorted[0];
  const last = sorted.at(-1);

  if (!first || !last) {
    return { deltaKg: 0, weeklyRateKg: 0 };
  }

  const deltaKg = Number((last.weightKg - first.weightKg).toFixed(1));
  const weeks = daysBetween(first.date, last.date) / 7;
  const weeklyRateKg = Number((deltaKg / weeks).toFixed(2));

  return { deltaKg, weeklyRateKg };
}

export function calculateMeasurementChanges(entries: BodyMeasurementsEntry[]): MeasurementChanges {
  if (entries.length < 2) {
    return { waistCm: 0, chestCm: 0, armCm: 0 };
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  const first = sorted[0];
  const last = sorted.at(-1);

  if (!first || !last) {
    return { waistCm: 0, chestCm: 0, armCm: 0 };
  }

  return {
    waistCm: Number((last.waistCm - first.waistCm).toFixed(1)),
    chestCm: Number((last.chestCm - first.chestCm).toFixed(1)),
    armCm: Number((last.armCm - first.armCm).toFixed(1)),
  };
}

export function summarizeAdherenceCorrelation(
  adherencePercent: number,
  trend: BodyweightTrend,
  changes: MeasurementChanges,
) {
  if (adherencePercent >= 85 && trend.deltaKg <= -1 && changes.waistCm <= -1) {
    return 'High adherence is aligning with fat-loss signals (weight and waist trending down).';
  }

  if (adherencePercent >= 85 && changes.armCm >= 0.4 && changes.chestCm >= 0.4) {
    return 'High adherence is aligning with hypertrophy signals (arm/chest measurements trending up).';
  }

  if (adherencePercent < 70) {
    return 'Lower adherence is likely limiting visible body-composition changes in this range.';
  }

  return 'Adherence and body metrics show mixed signals; keep consistency for another block.';
}
