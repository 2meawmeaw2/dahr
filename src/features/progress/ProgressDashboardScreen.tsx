import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';

import { spacing } from '@/theme/tokens';

import {
  type RangeFilter,
  milestones,
  movementPatternPrs,
  rangeDays,
  strengthEstimatePoints,
  workoutLogs,
} from './models';

const rangeOrder: RangeFilter[] = ['7d', '30d', '90d', 'all-time'];

function daysSince(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function dayLabel(date: string) {
  const [year = '0000', month = '00', day = '00'] = date.split('-');
  return `${month}/${day}/${year.slice(2)}`;
}

export function ProgressDashboardScreen() {
  const [range, setRange] = useState<RangeFilter>('30d');

  const filteredLogs = useMemo(() => {
    const maxDays = rangeDays[range];
    return workoutLogs.filter((item) => daysSince(item.date) <= maxDays);
  }, [range]);

  const adherence = useMemo(() => {
    const completed = filteredLogs.reduce((sum, item) => sum + item.completed, 0);
    const planned = filteredLogs.reduce((sum, item) => sum + item.planned, 0);
    return planned === 0 ? 0 : Math.round((completed / planned) * 100);
  }, [filteredLogs]);

  const streakDays = useMemo(() => {
    const sorted = [...workoutLogs].sort((a, b) => (a.date > b.date ? -1 : 1));
    let streak = 0;

    for (const entry of sorted) {
      if (entry.completed === 0) {
        break;
      }

      if (daysSince(entry.date) > 15) {
        break;
      }

      streak += 1;
    }

    return streak;
  }, []);

  const strengthCurves = useMemo(() => {
    const maxDays = rangeDays[range];
    const filtered = strengthEstimatePoints.filter(
      (item) => daysSince(item.date) <= maxDays || range === 'all-time',
    );

    return ['Pull', 'Push', 'Legs'].map((movement) => ({
      movement,
      points: filtered
        .filter((item) => item.movement === movement)
        .map((item, index) => ({ x: index + 1, y: item.estimate, label: dayLabel(item.date) })),
    }));
  }, [range]);

  const weeklyTrendData = filteredLogs
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((item, index) => ({ x: index + 1, y: item.volume, label: dayLabel(item.date) }));

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 26, fontWeight: '700' }}>Progress Dashboard</Text>
        <Text style={{ fontSize: 14, color: '#475569' }}>
          Streaks, volume trends, strength curves, and skill milestones.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {rangeOrder.map((item) => (
          <Pressable
            key={item}
            onPress={() => setRange(item)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              backgroundColor: range === item ? '#2563EB' : '#E2E8F0',
            }}
          >
            <Text style={{ color: range === item ? '#FFFFFF' : '#1E293B', fontWeight: '600' }}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View
          style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 12, padding: spacing.md }}
        >
          <Text style={{ fontSize: 13, color: '#1D4ED8' }}>Current streak</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#0F172A' }}>
            {streakDays} sessions
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: '#F8FAFC',
            borderRadius: 12,
            padding: spacing.md,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <Text style={{ fontSize: 13, color: '#475569' }}>Adherence</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#0F172A' }}>{adherence}%</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: spacing.md,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Weekly volume trend</Text>
        <View style={{ height: 220 }}>
          <CartesianChart data={weeklyTrendData} xKey="x" yKeys={['y']}>
            {({ points }) => (
              <Line points={points.y} color="#2563EB" strokeWidth={3} curveType="natural" />
            )}
          </CartesianChart>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Estimated strength progression</Text>
        {strengthCurves.map((curve) => (
          <View key={curve.movement} style={{ gap: 4 }}>
            <Text style={{ fontWeight: '600', color: '#334155' }}>{curve.movement}</Text>
            <View style={{ height: 120 }}>
              <CartesianChart data={curve.points} xKey="x" yKeys={['y']}>
                {({ points }) => (
                  <>
                    <Line
                      points={points.y}
                      color={
                        curve.movement === 'Legs'
                          ? '#7C3AED'
                          : curve.movement === 'Pull'
                            ? '#2563EB'
                            : '#0EA5E9'
                      }
                      strokeWidth={2.5}
                      curveType="natural"
                    />
                    <Scatter points={points.y} color="#0F172A" radius={2.5} />
                  </>
                )}
              </CartesianChart>
            </View>
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Skill milestones</Text>
        {milestones
          .filter(
            (milestone) => daysSince(milestone.date) <= rangeDays[range] || range === 'all-time',
          )
          .map((milestone) => (
            <View
              key={`${milestone.skill}-${milestone.stage}`}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: spacing.sm,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Text style={{ fontWeight: '700', color: '#0F172A' }}>{milestone.skill}</Text>
              <Text style={{ color: '#334155' }}>{milestone.stage}</Text>
              <Text style={{ color: '#64748B', fontSize: 12 }}>
                {dayLabel(milestone.date)} · confidence {Math.round(milestone.confidence * 100)}%
              </Text>
            </View>
          ))}
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          padding: spacing.md,
          gap: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '600' }}>PRs by movement pattern</Text>
        {movementPatternPrs.map((pattern) => (
          <View
            key={pattern.pattern}
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              padding: spacing.sm,
              gap: 4,
            }}
          >
            <Text style={{ fontWeight: '700', color: '#0F172A' }}>{pattern.pattern}</Text>
            <Text style={{ color: '#334155' }}>Max reps: {pattern.maxReps}</Text>
            <Text style={{ color: '#334155' }}>
              Hardest progression: {pattern.hardestProgression}
            </Text>
            <Text style={{ color: '#334155' }}>
              Weighted variation: +{pattern.weightedVariationKg} kg
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
