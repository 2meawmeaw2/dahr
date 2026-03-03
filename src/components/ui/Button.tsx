import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

type ButtonProps = {
  label: string;
  onPress?: () => void;
};

export function Button({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={async () => {
        await Haptics.selectionAsync();
        onPress?.();
      }}
      style={{
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: colors.textOnPrimary, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
