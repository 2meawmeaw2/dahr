import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';

import { computeReadiness, type DailyCheckIn } from '@/features/recovery';
import { spacing } from '@/theme/tokens';

type SetLog = {
  reps: string;
  load: string;
  rpe: string;
  notes: string;
  completed: boolean;
};

type Exercise = {
  id: string;
  name: string;
  sets: number;
  repTarget: string;
  videoLabel: string;
  techniqueCues: string[];
};

type Block = {
  title: string;
  exercises: Exercise[];
};

type ExerciseAction = 'active' | 'skipped' | 'replaced' | 'regressed' | 'progressed';

const blocks: Block[] = [
  {
    title: 'Warm-up',
    exercises: [
      {
        id: 'wu-1',
        name: 'Bike Erg',
        sets: 1,
        repTarget: '6 min easy spin',
        videoLabel: 'Demo: easy cadence + nasal breathing',
        techniqueCues: ['Relaxed shoulders', 'RPM around 80-90', 'Breathing through the nose'],
      },
      {
        id: 'wu-2',
        name: 'Goblet Squat Patterning',
        sets: 2,
        repTarget: '8 controlled reps',
        videoLabel: 'Demo: goblet squat patterning',
        techniqueCues: [
          'Brace before descent',
          'Knees track over toes',
          'Pause for 1 second at bottom',
        ],
      },
    ],
  },
  {
    title: 'Main Block',
    exercises: [
      {
        id: 'main-1',
        name: 'Back Squat',
        sets: 4,
        repTarget: '5 reps @ RPE 7-8',
        videoLabel: 'Demo: low-bar back squat setup',
        techniqueCues: [
          'Screw feet into the floor',
          'Stay stacked through midpoint',
          'Drive traps into the bar',
        ],
      },
      {
        id: 'main-2',
        name: 'Romanian Deadlift',
        sets: 3,
        repTarget: '8 reps @ RPE 7',
        videoLabel: 'Demo: RDL hinge mechanics',
        techniqueCues: [
          'Push hips back',
          'Lats tight and bar close',
          'Stop when pelvis starts to tuck',
        ],
      },
    ],
  },
];

const actionLabels: Record<ExerciseAction, string> = {
  active: 'Active',
  skipped: 'Skipped',
  replaced: 'Replaced',
  regressed: 'Regressed',
  progressed: 'Progressed',
};

const quickRestPresets = [45, 60, 90, 120];

const checkInScale = [1, 2, 3, 4, 5];

const sleepDurationOptions = [5, 6, 7, 8, 9];

function createLogState() {
  return blocks.reduce<Record<string, SetLog[]>>((acc, block) => {
    for (const exercise of block.exercises) {
      acc[exercise.id] = Array.from({ length: exercise.sets }, () => ({
        reps: '',
        load: '',
        rpe: '',
        notes: '',
        completed: false,
      }));
    }

    return acc;
  }, {});
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function WorkoutExecutionScreen() {
  const [logs, setLogs] = useState<Record<string, SetLog[]>>(() => createLogState());
  const [exerciseActions, setExerciseActions] = useState<Record<string, ExerciseAction>>({});
  const [autoStartRest, setAutoStartRest] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [checkIn, setCheckIn] = useState<DailyCheckIn>({
    sleepQuality: 3,
    sleepDurationHours: 7,
    soreness: 3,
    stress: 3,
    motivation: 3,
  });

  useEffect(() => {
    if (restRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setRestRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [restRemaining]);

  const allExercises = blocks.flatMap((block) => block.exercises);
  const readiness = useMemo(() => computeReadiness(checkIn), [checkIn]);

  const summary = useMemo(() => {
    let totalVolume = 0;
    let totalCompletedSets = 0;
    let totalPlannedSets = 0;
    let rpeTotal = 0;
    let rpeCount = 0;

    for (const exercise of allExercises) {
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

    const adherence =
      totalPlannedSets === 0 ? 0 : Math.round((totalCompletedSets / totalPlannedSets) * 100);
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
  }, [allExercises, logs, readiness.zone]);

  const updateCheckIn = <K extends keyof DailyCheckIn>(field: K, value: DailyCheckIn[K]) => {
    setCheckIn((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const renderScale = <K extends keyof DailyCheckIn>(
    field: K,
    selectedValue: DailyCheckIn[K],
    labels: Record<number, string>,
  ) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {checkInScale.map((value) => {
        const active = selectedValue === value;
        return (
          <Pressable
            key={`${String(field)}-${value}`}
            onPress={() => updateCheckIn(field, value as DailyCheckIn[K])}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? '#1D4ED8' : '#CBD5E1',
              backgroundColor: active ? '#DBEAFE' : '#FFFFFF',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600' }}>
              {value} · {labels[value]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const updateSetField = (
    exerciseId: string,
    setIndex: number,
    field: keyof SetLog,
    value: string | boolean,
  ) => {
    setLogs((current) => ({
      ...current,
      [exerciseId]: (current[exerciseId] ?? []).map((set, index) =>
        index === setIndex
          ? {
              ...set,
              [field]: value,
            }
          : set,
      ),
    }));
  };

  const markSetCompleted = (exerciseId: string, setIndex: number) => {
    updateSetField(exerciseId, setIndex, 'completed', true);

    if (autoStartRest) {
      setRestRemaining(selectedPreset);
    }
  };

  const setAction = (exerciseId: string, action: ExerciseAction) => {
    setExerciseActions((current) => ({
      ...current,
      [exerciseId]: action,
    }));
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 26, fontWeight: '700' }}>Workout Session</Text>
        <Text style={{ fontSize: 15, color: '#475569' }}>
          Execution view with set logging, rest control, and coaching cues.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 12,
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Daily Recovery Check-in</Text>
        <Text style={{ color: '#475569' }}>
          Tell us how you feel before training. We adjust your session automatically.
        </Text>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Sleep quality</Text>
          {renderScale('sleepQuality', checkIn.sleepQuality, {
            1: 'poor',
            2: 'rough',
            3: 'ok',
            4: 'good',
            5: 'great',
          })}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Sleep duration</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sleepDurationOptions.map((hours) => {
              const active = checkIn.sleepDurationHours === hours;
              return (
                <Pressable
                  key={`sleep-hours-${hours}`}
                  onPress={() => updateCheckIn('sleepDurationHours', hours)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? '#1D4ED8' : '#CBD5E1',
                    backgroundColor: active ? '#DBEAFE' : '#FFFFFF',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600' }}>{hours}h</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Soreness</Text>
          {renderScale('soreness', checkIn.soreness, {
            1: 'none',
            2: 'mild',
            3: 'moderate',
            4: 'high',
            5: 'very high',
          })}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Stress</Text>
          {renderScale('stress', checkIn.stress, {
            1: 'calm',
            2: 'low',
            3: 'moderate',
            4: 'high',
            5: 'very high',
          })}
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{ fontWeight: '600' }}>Motivation</Text>
          {renderScale('motivation', checkIn.motivation, {
            1: 'very low',
            2: 'low',
            3: 'steady',
            4: 'high',
            5: 'very high',
          })}
        </View>

        <View style={{ backgroundColor: '#E2E8F0', borderRadius: 10, padding: spacing.sm, gap: 4 }}>
          <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>
            Readiness: {readiness.zone} ({readiness.score}/100)
          </Text>
          <Text style={{ color: '#1E293B' }}>{readiness.sessionAdjustment}</Text>
          <Text style={{ color: '#334155' }}>{readiness.athleteRationale}</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 12,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Rest Timer</Text>
        <Text style={{ fontSize: 14, color: '#334155' }}>
          {restRemaining > 0 ? `Rest: ${restRemaining}s` : 'Ready for next set'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {quickRestPresets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => {
                setSelectedPreset(preset);
                setRestRemaining(preset);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selectedPreset === preset ? '#1D4ED8' : '#CBD5E1',
                backgroundColor: selectedPreset === preset ? '#DBEAFE' : 'white',
              }}
            >
              <Text style={{ color: '#0F172A', fontWeight: '600' }}>{preset}s</Text>
            </Pressable>
          ))}
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text style={{ fontSize: 14, color: '#334155' }}>
            Auto-start rest after logging a set
          </Text>
          <Switch value={autoStartRest} onValueChange={setAutoStartRest} />
        </View>
      </View>

      {blocks.map((block) => (
        <View key={block.title} style={{ gap: spacing.sm }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>{block.title}</Text>
          {block.exercises.map((exercise) => {
            const setLogs = logs[exercise.id] ?? [];
            const exerciseAction = exerciseActions[exercise.id] ?? 'active';

            return (
              <View
                key={exercise.id}
                style={{
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  borderRadius: 14,
                  padding: spacing.md,
                  backgroundColor: '#FFFFFF',
                  gap: spacing.sm,
                }}
              >
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 17, fontWeight: '600' }}>{exercise.name}</Text>
                  <Text style={{ fontSize: 14, color: '#475569' }}>
                    Prescription: {exercise.sets} x {exercise.repTarget}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#0F766E' }}>
                    Status: {actionLabels[exerciseAction]}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#F1F5F9',
                    borderRadius: 10,
                    padding: spacing.sm,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>Video / Demo</Text>
                  <Text style={{ color: '#334155' }}>{exercise.videoLabel}</Text>
                  <Text style={{ fontWeight: '600', marginTop: 4 }}>Technique Cues</Text>
                  {exercise.techniqueCues.map((cue) => (
                    <Text key={cue} style={{ color: '#334155' }}>
                      • {cue}
                    </Text>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(['skipped', 'replaced', 'regressed', 'progressed'] as ExerciseAction[]).map(
                    (action) => (
                      <Pressable
                        key={action}
                        onPress={() => setAction(exercise.id, action)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: exerciseAction === action ? '#1D4ED8' : '#CBD5E1',
                          backgroundColor: exerciseAction === action ? '#DBEAFE' : '#FFFFFF',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600' }}>
                          {actionLabels[action]}
                        </Text>
                      </Pressable>
                    ),
                  )}
                  <Pressable
                    onPress={() => setAction(exercise.id, 'active')}
                    style={{ paddingVertical: 6, paddingHorizontal: 10 }}
                  >
                    <Text style={{ fontSize: 12, color: '#1D4ED8' }}>Reset</Text>
                  </Pressable>
                </View>

                {setLogs.map((set, setIndex) => (
                  <View
                    key={`${exercise.id}-${setIndex}`}
                    style={{
                      borderWidth: 1,
                      borderColor: '#E2E8F0',
                      borderRadius: 10,
                      padding: spacing.sm,
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontWeight: '600' }}>Set {setIndex + 1}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput
                        placeholder="Reps"
                        keyboardType="numeric"
                        value={set.reps}
                        onChangeText={(value) =>
                          updateSetField(exercise.id, setIndex, 'reps', value)
                        }
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#CBD5E1',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      />
                      <TextInput
                        placeholder="Load"
                        keyboardType="numeric"
                        value={set.load}
                        onChangeText={(value) =>
                          updateSetField(exercise.id, setIndex, 'load', value)
                        }
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#CBD5E1',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      />
                      <TextInput
                        placeholder="RPE"
                        keyboardType="numeric"
                        value={set.rpe}
                        onChangeText={(value) =>
                          updateSetField(exercise.id, setIndex, 'rpe', value)
                        }
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: '#CBD5E1',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                        }}
                      />
                    </View>
                    <TextInput
                      placeholder="Notes"
                      value={set.notes}
                      onChangeText={(value) =>
                        updateSetField(exercise.id, setIndex, 'notes', value)
                      }
                      style={{
                        borderWidth: 1,
                        borderColor: '#CBD5E1',
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                      }}
                    />
                    <Pressable
                      onPress={() => markSetCompleted(exercise.id, setIndex)}
                      style={{
                        backgroundColor: set.completed ? '#16A34A' : '#2563EB',
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                        {set.completed ? 'Completed' : 'Log Set'}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ))}

      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 12,
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
          Completion Summary
        </Text>
        <Text style={{ color: '#E2E8F0' }}>Total volume: {summary.totalVolume.toFixed(0)} kg</Text>
        <Text style={{ color: '#E2E8F0' }}>Session adherence: {summary.adherence}%</Text>
        <Text style={{ color: '#E2E8F0', textTransform: 'capitalize' }}>
          Readiness zone: {readiness.zone} ({readiness.score}/100)
        </Text>
        <Text style={{ color: '#E2E8F0' }}>Fatigue marker: {summary.fatigueMarker}</Text>
        <Text style={{ color: '#E2E8F0' }}>Session adjustment: {summary.sessionPlan}</Text>
        <Text style={{ color: '#E2E8F0' }}>Why: {readiness.athleteRationale}</Text>
        <Text style={{ color: '#93C5FD' }}>Next progression: {summary.progressionSuggestion}</Text>
      </View>
    </ScrollView>
  );
}
