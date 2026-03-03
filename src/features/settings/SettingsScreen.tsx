import * as Haptics from 'expo-haptics'
import { Component, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Switch, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { getSyncQueueState } from '@/lib/sync'
import { spacing } from '@/theme/tokens'

import {
  clearAllStoredData,
  defaultSettingsPreferences,
  exportAllDataAsCsv,
  exportAllDataAsJson,
  getSettingsPreferences,
  resetSettingsPreferences,
  saveSettingsPreferences,
  type SettingsPreferences,
  type ThemePreference,
  type TimeFormatPreference,
  type UnitsPreference,
} from './preferences'
import {
  getNotificationPermissionSummary,
  getReminderMap,
  setReminderEnabled,
  setupLocalNotifications,
  type ReminderMap,
  type ReminderType,
} from './notifications'
import { syncPendingSettingsActions } from './syncService'

type SyncStateView = {
  lastSyncAt?: string
  pendingActions: number
}

class SettingsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static override getDerivedStateFromError() {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ fontSize: 22, fontWeight: '700' }}>Settings temporarily unavailable</Text>
          <Text>Something went wrong while rendering this screen. Reload the app and try again.</Text>
        </View>
      )
    }

    return this.props.children
  }
}

function SegmentedOption<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: { label: string; value: T }[]
  selected: T
  onChange: (value: T) => void
}) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {options.map((option) => {
        const active = selected === option.value

        return (
          <Pressable
            key={option.value}
            onPress={async () => {
              await Haptics.selectionAsync()
              onChange(option.value)
            }}
            style={{
              borderRadius: 999,
              backgroundColor: active ? '#2563EB' : '#E2E8F0',
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
          >
            <Text style={{ color: active ? '#FFFFFF' : '#0F172A', fontWeight: '600' }}>{option.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function SettingsSkeleton() {
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={{ backgroundColor: '#E2E8F0', borderRadius: 12, height: 88 }} />
      ))}
    </View>
  )
}

function SettingsScreenContent() {
  const [syncState, setSyncState] = useState<SyncStateView>({ pendingActions: 0 })
  const [statusMessage, setStatusMessage] = useState('Idle')
  const [preferences, setPreferences] = useState<SettingsPreferences>(defaultSettingsPreferences)
  const [reminders, setReminders] = useState<ReminderMap | null>(null)
  const [permissionSummary, setPermissionSummary] = useState('Checking notification permissions...')
  const [loading, setLoading] = useState(true)
  const [exportPayload, setExportPayload] = useState('')
  const [clearGuard, setClearGuard] = useState(false)

  const refreshSyncState = useCallback(async () => {
    const state = await getSyncQueueState()
    setSyncState({
      lastSyncAt: state.lastSyncAt,
      pendingActions: state.actions.length,
    })
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sync, loadedPreferences, loadedReminders, permission] = await Promise.all([
        getSyncQueueState(),
        getSettingsPreferences(),
        getReminderMap(),
        getNotificationPermissionSummary(),
      ])

      setSyncState({ lastSyncAt: sync.lastSyncAt, pendingActions: sync.actions.length })
      setPreferences(loadedPreferences)
      setReminders(loadedReminders)
      setPermissionSummary(permission)
      setStatusMessage('Settings loaded.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const persistPreferences = useCallback(
    async (nextPreferences: SettingsPreferences) => {
      setPreferences(nextPreferences)
      await saveSettingsPreferences(nextPreferences)
      await refreshSyncState()
      setStatusMessage('Preferences updated.')
    },
    [refreshSyncState],
  )

  const handlePreferenceChange = async <K extends keyof SettingsPreferences>(key: K, value: SettingsPreferences[K]) => {
    const next = {
      ...preferences,
      [key]: value,
    }

    await persistPreferences(next)
  }

  const handleToggleReminder = async (reminderType: ReminderType, enabled: boolean) => {
    try {
      const next = await setReminderEnabled(reminderType, enabled)
      setReminders(next)
      await refreshSyncState()
      setStatusMessage('Reminder preference updated.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to update reminder preference.')
    }
  }

  const handleSetupNotifications = async () => {
    try {
      await setupLocalNotifications()
      setPermissionSummary(await getNotificationPermissionSummary())
      setStatusMessage('Local reminders set and queued for sync.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to setup reminders.')
    }

    await refreshSyncState()
  }

  const handleSyncNow = async () => {
    await syncPendingSettingsActions()
    await refreshSyncState()
    setStatusMessage('Sync attempt completed.')
  }

  const handleExport = async (format: 'json' | 'csv') => {
    const payload = format === 'json' ? await exportAllDataAsJson() : await exportAllDataAsCsv()
    setExportPayload(payload)
    setStatusMessage(`Generated ${format.toUpperCase()} export preview below.`)
  }

  const handleResetPreferences = async () => {
    await resetSettingsPreferences()
    setPreferences(defaultSettingsPreferences)
    await refreshSyncState()
    setStatusMessage('Preferences reset to defaults (dark theme, kg, 24-hour clock).')
  }

  const handleClearAllData = async () => {
    if (!clearGuard) {
      setClearGuard(true)
      setStatusMessage('Tap "Clear all data" again to confirm destructive reset.')
      return
    }

    await clearAllStoredData()
    setClearGuard(false)
    setExportPayload('')
    await loadData()
    setStatusMessage('All local data cleared from this device.')
  }

  const privacyCopy = useMemo(
    () =>
      'Privacy: your training data, settings, and reminders stay on-device first. Sync only transfers queued setting updates required to keep your experience consistent across signed-in devices.',
    [],
  )

  return (
    <ScrollView
      contentContainerStyle={{
        padding: spacing.lg,
        gap: spacing.md,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Settings</Text>
      <Text>Control preferences, privacy, notifications, exports, and reset actions.</Text>

      {loading ? <SettingsSkeleton /> : null}

      {!loading ? (
        <>
          <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Display and training preferences</Text>
            <Text>Units</Text>
            <SegmentedOption<UnitsPreference>
              selected={preferences.units}
              onChange={(value) => {
                void handlePreferenceChange('units', value)
              }}
              options={[
                { label: 'Kilograms (kg)', value: 'kg' },
                { label: 'Pounds (lb)', value: 'lb' },
              ]}
            />

            <Text>Time format</Text>
            <SegmentedOption<TimeFormatPreference>
              selected={preferences.timeFormat}
              onChange={(value) => {
                void handlePreferenceChange('timeFormat', value)
              }}
              options={[
                { label: '24-hour', value: '24h' },
                { label: '12-hour', value: '12h' },
              ]}
            />

            <Text>Theme</Text>
            <SegmentedOption<ThemePreference>
              selected={preferences.theme}
              onChange={(value) => {
                void handlePreferenceChange('theme', value)
              }}
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
                { label: 'System', value: 'system' },
              ]}
            />
            <Text style={{ color: '#475569' }}>Dark mode is the default for reduced glare in training environments.</Text>
          </View>

          <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Notifications</Text>
            <Text>{permissionSummary}</Text>
            <Text style={{ color: '#475569' }}>
              Permission explanation: reminders are used only for workout cadence, readiness check-ins, and recovery prompts. We do not send marketing pushes.
            </Text>
            {(Object.entries(reminders ?? {}) as [ReminderType, ReminderMap[ReminderType]][]).map(([type, config]) => (
              <View key={type} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ textTransform: 'capitalize' }}>{type} reminders</Text>
                <Switch
                  value={config.enabled}
                  onValueChange={(value) => {
                    void handleToggleReminder(type, value)
                  }}
                />
              </View>
            ))}
            <Button label="Apply reminder schedule" onPress={() => void handleSetupNotifications()} />
          </View>

          <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Data controls</Text>
            <Text>{privacyCopy}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Export JSON" onPress={() => void handleExport('json')} />
              <Button label="Export CSV" onPress={() => void handleExport('csv')} />
            </View>
            {exportPayload ? (
              <Text style={{ maxHeight: 180, fontFamily: 'monospace', color: '#334155' }} numberOfLines={12}>
                {exportPayload}
              </Text>
            ) : (
              <Text style={{ color: '#64748B' }}>No export generated yet.</Text>
            )}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Reset preferences" onPress={() => void handleResetPreferences()} />
              <Button label="Clear all data" onPress={() => void handleClearAllData()} />
            </View>
            <Text style={{ color: '#B91C1C' }}>Clear all data removes local profile, workout history, and settings from this device.</Text>
          </View>
        </>
      ) : null}

      <View style={{ gap: spacing.sm, padding: spacing.md, backgroundColor: '#F8FAFC', borderRadius: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>Sync status</Text>
        <Text>Last sync: {syncState.lastSyncAt ? new Date(syncState.lastSyncAt).toLocaleString() : 'Never'}</Text>
        <Text>Pending actions: {syncState.pendingActions}</Text>
        <Button label="Sync now" onPress={() => void handleSyncNow()} />
      </View>

      <Text style={{ color: '#334155' }}>{statusMessage}</Text>
    </ScrollView>
  )
}

export function SettingsScreen() {
  return (
    <SettingsErrorBoundary>
      <SettingsScreenContent />
    </SettingsErrorBoundary>
  )
}
