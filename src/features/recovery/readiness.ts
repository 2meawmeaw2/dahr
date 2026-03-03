export type DailyCheckIn = {
  sleepQuality: number;
  sleepDurationHours: number;
  soreness: number;
  stress: number;
  motivation: number;
};

export type ReadinessZone = 'green' | 'yellow' | 'red';

export type ReadinessAssessment = {
  score: number;
  zone: ReadinessZone;
  sessionAdjustment: string;
  athleteRationale: string;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function normalizeToFivePointScale(value: number, min: number, max: number) {
  if (max <= min) {
    return 3;
  }

  const normalized = ((value - min) / (max - min)) * 4 + 1;
  return clamp(normalized, 1, 5);
}

export function computeReadiness(checkIn: DailyCheckIn): ReadinessAssessment {
  const sleepDurationScore = normalizeToFivePointScale(checkIn.sleepDurationHours, 4, 9);

  const weightedScore =
    checkIn.sleepQuality * 0.25 +
    sleepDurationScore * 0.2 +
    (6 - checkIn.soreness) * 0.2 +
    (6 - checkIn.stress) * 0.2 +
    checkIn.motivation * 0.15;

  const score = Math.round((weightedScore / 5) * 100);

  const zone: ReadinessZone = score >= 75 ? 'green' : score >= 55 ? 'yellow' : 'red';

  const sessionAdjustment =
    zone === 'green'
      ? 'Normal plan: keep prescribed volume and intensity.'
      : zone === 'yellow'
        ? 'Reduced plan: trim volume and intensity to manage fatigue.'
        : 'Recovery swap: move to mobility + active recovery template.';

  const rationaleParts: string[] = [];
  if (checkIn.sleepQuality <= 2 || checkIn.sleepDurationHours < 6) {
    rationaleParts.push('Sleep was limited, so recovery capacity is lower today.');
  }
  if (checkIn.soreness >= 4) {
    rationaleParts.push(
      'Reported soreness is high, which can reduce movement quality under heavy loading.',
    );
  }
  if (checkIn.stress >= 4) {
    rationaleParts.push(
      'Stress is elevated, so we are biasing the session toward sustainable effort.',
    );
  }
  if (checkIn.motivation <= 2) {
    rationaleParts.push('Motivation is low, so the plan prioritizes consistency over intensity.');
  }

  if (rationaleParts.length === 0) {
    rationaleParts.push('Your check-in shows solid recovery signals, so you can train as planned.');
  }

  return {
    score,
    zone,
    sessionAdjustment,
    athleteRationale: rationaleParts.join(' '),
  };
}
