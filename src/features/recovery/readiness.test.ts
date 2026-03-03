import { describe, expect, it } from 'vitest';

import { computeReadiness } from './readiness';

describe('computeReadiness', () => {
  it('scores highly recovered athletes in green zone', () => {
    const result = computeReadiness({
      sleepQuality: 5,
      sleepDurationHours: 8,
      soreness: 1,
      stress: 1,
      motivation: 5,
    });

    expect(result.zone).toBe('green');
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.sessionAdjustment).toContain('Normal plan');
  });

  it('flags poor recovery in red zone with rationale', () => {
    const result = computeReadiness({
      sleepQuality: 1,
      sleepDurationHours: 5,
      soreness: 5,
      stress: 5,
      motivation: 1,
    });

    expect(result.zone).toBe('red');
    expect(result.score).toBeLessThan(55);
    expect(result.athleteRationale).toContain('Sleep was limited');
    expect(result.athleteRationale).toContain('Reported soreness is high');
  });
});
