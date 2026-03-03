import { describe, expect, it } from 'vitest';

import { buildProgram } from './planBuilder';

describe('buildProgram progression engine', () => {
  const program = buildProgram({
    name: 'Test Program',
    totalWeeks: 8,
    sessionsPerWeek: 4,
    availableEquipment: ['bodyweight', 'pullup-bar'],
    injuries: ['wrist-pain'],
    preferredSkills: ['handstand'],
  });

  it('creates progression and deload cadence', () => {
    expect(program.weeks).toHaveLength(8);
    expect(program.weeks[3]?.deload).toBe(true);
    expect(program.weeks[7]?.deload).toBe(true);
    expect(program.progressionRules).toHaveLength(4);
  });

  it('applies substitutions when equipment or injury blocks primary exercise', () => {
    const firstWeekFirstSession = program.weeks[0]?.sessions[0];
    const pushBlock = firstWeekFirstSession?.blocks.find((block) => block.category === 'push');
    const pullBlock = firstWeekFirstSession?.blocks.find((block) => block.category === 'pull');

    expect(pushBlock?.exercise.name).toBe('pike push-up');
    expect(pullBlock?.exercise.name).toBe('pull-up');
  });

  it('adds skill blocks and advances ladder over time', () => {
    const weekOneSkill = program.weeks[0]?.sessions[0]?.blocks.find((block) => block.category === 'skill');
    const weekFiveSkill = program.weeks[4]?.sessions[0]?.blocks.find((block) => block.category === 'skill');

    expect(weekOneSkill?.exercise.name).toBe('wall handstand hold');
    expect(weekFiveSkill?.exercise.name).toBe('freestanding handstand kick-up');
  });
});
