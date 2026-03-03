import { type DailyCheckIn, computeReadiness } from '../recovery/readiness';

export type SetLog = {
  reps: string;
  load: string;
  rpe: string;
  notes: string;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  sets: number;
};

export type WorkoutSummary = {
  totalVolume: number;
  adherence: number;
  fatigueMarker: string;
  sessionPlan: string;
  progressionSuggestion: string;
};

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const createExerciseLogState = (exercises: WorkoutExercise[]): Record<string, SetLog[]> =>
  exercises.reduce<Record<string, SetLog[]>>((acc, exercise) => {
    acc[exercise.id] = Array.from({ length: exercise.sets }, () => ({
      reps: '',
      load: '',
      rpe: '',
      notes: '',
      completed: false,
    }));

    return acc;
  }, {});

export const markSetAsCompleted = (
  logs: Record<string, SetLog[]>,
  exerciseId: string,
  setIndex: number,
): Record<string, SetLog[]> => ({
  ...logs,
  [exerciseId]: (logs[exerciseId] ?? []).map((set, index) =>
    index === setIndex
      ? {
          ...set,
          completed: true,
        }
      : set,
  ),
});

export const buildWorkoutSummary = (
  exercises: WorkoutExercise[],
  logs: Record<string, SetLog[]>,
  checkIn: DailyCheckIn,
): WorkoutSummary => {
  let totalVolume = 0;
  let totalCompletedSets = 0;
  let totalPlannedSets = 0;
  let rpeTotal = 0;
  let rpeCount = 0;

  for (const exercise of exercises) {
    const setLogs = logs[exercise.id] ?? [];
    totalPlannedSets += exercise.sets;

    for (const set of setLogs) {
      if (!set.completed) {
        continue;
      }

      totalCompletedSets += 1;
      totalVolume += toNumber(set.reps) * toNumber(set.load);

      const rpe = toNumber(set.rpe);
      if (rpe > 0) {
        rpeTotal += rpe;
        rpeCount += 1;
      }
    }
  }

  const readiness = computeReadiness(checkIn);
  const adherence = totalPlannedSets === 0 ? 0 : Math.round((totalCompletedSets / totalPlannedSets) * 100);
  const avgRpe = rpeCount === 0 ? 0 : rpeTotal / rpeCount;

  const fatigueMarker =
    avgRpe >= 8.5
      ? 'High fatigue observed in set logs.'
      : avgRpe >= 7
        ? 'Moderate fatigue observed in set logs.'
        : 'Low fatigue observed in set logs.';

  const sessionPlan =
    readiness.zone === 'green'
      ? 'Green readiness: run the normal session plan today.'
      : readiness.zone === 'yellow'
        ? 'Yellow readiness: reduce working sets and keep intensity submaximal.'
        : 'Red readiness: swap this workout for mobility and active recovery work.';

  const progressionSuggestion =
    readiness.zone === 'red'
      ? 'Recovery day selected: defer loading progress and restore movement quality.'
      : adherence >= 90 && avgRpe <= 7.5 && readiness.zone === 'green'
        ? 'Progress top sets by +2.5% load next workout.'
        : adherence >= 75
          ? 'Repeat progression wave and add one rep on final set.'
          : 'Use regression path: reduce load by 5% and rebuild form quality.';

  return {
    totalVolume,
    adherence,
    fatigueMarker,
    sessionPlan,
    progressionSuggestion,
  };
};
