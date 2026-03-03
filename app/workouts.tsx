import { Text, View } from 'react-native';

import { WorkoutChart } from '@/features/workouts/WorkoutChart';
import { spacing } from '@/theme/tokens';

export default function WorkoutsScreen() {
  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Workouts</Text>
      <WorkoutChart />
    </View>
  );
}
