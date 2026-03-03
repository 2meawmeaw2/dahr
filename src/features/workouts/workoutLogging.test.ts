import { describe, expect, it } from 'vitest';

import { createExerciseLogState, buildWorkoutSummary, markSetAsCompleted } from './workoutLogging';

describe('workout logging flow helpers', () => {
  const exercises = [
    { id: 'a', sets: 2 },
    { id: 'b', sets: 1 },
  ];

  it('creates initial log buckets per exercise and set', () => {
    const logs = createExerciseLogState(exercises);
    expect(logs.a).toHaveLength(2);
    expect(logs.b).toHaveLength(1);
    expect(logs.a?.[0]?.completed).toBe(false);
  });

  it('marks a set completed and updates adherence/volume summary', () => {
    let logs = createExerciseLogState(exercises);
    logs.a![0] = { reps: '10', load: '50', rpe: '7', notes: '', completed: false };
    logs = markSetAsCompleted(logs, 'a', 0);

    const summary = buildWorkoutSummary(exercises, logs, {
      sleepQuality: 4,
      sleepDurationHours: 8,
      soreness: 2,
      stress: 2,
      motivation: 4,
    });

    expect(summary.totalVolume).toBe(500);
    expect(summary.adherence).toBe(33);
    expect(summary.fatigueMarker).toContain('Moderate');
    expect(summary.sessionPlan).toContain('Green readiness');
  });
});
