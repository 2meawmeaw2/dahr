import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/tokens';

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        padding: spacing.lg,
        justifyContent: 'center',
        gap: spacing.md,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700' }}>DAHR starter app</Text>
      <Text>Feature-first Expo Router + Zustand + React Query bootstrap.</Text>
      <Link href="/workouts" asChild>
        <Button label="Open workouts" />
      </Link>
      <Link href="/exercises" asChild>
        <Button label="Open exercise library" />
      </Link>
    </View>
  );
}
