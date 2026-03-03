import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { getSyncQueueState } from '@/lib/sync';
import { spacing } from '@/theme/tokens';

import { setupLocalNotifications } from './notifications';
import { syncPendingSettingsActions } from './syncService';

type SyncStateView = {
  lastSyncAt?: string;
  pendingActions: number;
};

export function SettingsScreen() {
  const [syncState, setSyncState] = useState<SyncStateView>({ pendingActions: 0 });
  const [statusMessage, setStatusMessage] = useState('Idle');

  const refreshSyncState = useCallback(async () => {
    const state = await getSyncQueueState();
    setSyncState({
      lastSyncAt: state.lastSyncAt,
      pendingActions: state.actions.length,
    });
  }, []);

  useEffect(() => {
    refreshSyncState();
  }, [refreshSyncState]);

  const handleSetupNotifications = async () => {
    try {
      await setupLocalNotifications();
      setStatusMessage('Local reminders set and queued for sync.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to setup reminders.');
    }

    await refreshSyncState();
  };

  const handleSyncNow = async () => {
    await syncPendingSettingsActions();
    await refreshSyncState();
    setStatusMessage('Sync attempt completed.');
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Settings</Text>
      <Text>Configure reminders and track sync health.</Text>

      <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Local notifications</Text>
        <Text>• Workout reminders</Text>
        <Text>• Readiness check-in reminders</Text>
        <Text>• Recovery day prompts</Text>
        <Button label="Setup local reminders" onPress={handleSetupNotifications} />
      </View>

      <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Sync status</Text>
        <Text>Last sync: {syncState.lastSyncAt ? new Date(syncState.lastSyncAt).toLocaleString() : 'Never'}</Text>
        <Text>Pending actions: {syncState.pendingActions}</Text>
        <Button label="Sync now" onPress={handleSyncNow} />
      </View>

      <Text style={{ color: '#334155' }}>{statusMessage}</Text>
    </ScrollView>
  );
}
