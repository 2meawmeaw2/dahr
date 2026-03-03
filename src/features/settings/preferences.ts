import AsyncStorage from '@react-native-async-storage/async-storage'

import { enqueueSyncAction } from '@/lib/sync'

export type UnitsPreference = 'kg' | 'lb'
export type TimeFormatPreference = '12h' | '24h'
export type ThemePreference = 'dark' | 'light' | 'system'

export type SettingsPreferences = {
  units: UnitsPreference
  timeFormat: TimeFormatPreference
  theme: ThemePreference
}

const PREFERENCES_KEY = 'settings:preferences:v1'

export const defaultSettingsPreferences: SettingsPreferences = {
  units: 'kg',
  timeFormat: '24h',
  theme: 'dark',
}

export async function getSettingsPreferences(): Promise<SettingsPreferences> {
  const raw = await AsyncStorage.getItem(PREFERENCES_KEY)
  if (!raw) {
    return defaultSettingsPreferences
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>
    return {
      units: parsed.units === 'lb' ? 'lb' : 'kg',
      timeFormat: parsed.timeFormat === '12h' ? '12h' : '24h',
      theme: parsed.theme === 'light' || parsed.theme === 'system' ? parsed.theme : 'dark',
    }
  } catch {
    return defaultSettingsPreferences
  }
}

export async function saveSettingsPreferences(preferences: SettingsPreferences) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))

  await enqueueSyncAction({
    type: 'notification.preference.updated',
    entityKey: 'settings:preferences',
    localVersion: Date.now(),
    payload: preferences,
  })
}

export async function resetSettingsPreferences() {
  await saveSettingsPreferences(defaultSettingsPreferences)
}

export async function exportAllDataAsJson() {
  const keys = await AsyncStorage.getAllKeys()
  const entries: [string, string | null][] = await Promise.all(
    keys.map(async (key) => [key, await AsyncStorage.getItem(key)]),
  )
  const payload = Object.fromEntries(
    entries.map(([key, value]) => {
      if (!value) {
        return [key, null]
      }

      try {
        return [key, JSON.parse(value)]
      } catch {
        return [key, value]
      }
    }),
  )

  return JSON.stringify(payload, null, 2)
}

function encodeCsvCell(value: unknown) {
  const asString = typeof value === 'string' ? value : JSON.stringify(value)
  const escaped = asString.replace(/"/g, '""')
  return `"${escaped}"`
}

export async function exportAllDataAsCsv() {
  const keys = await AsyncStorage.getAllKeys()
  const entries: [string, string | null][] = await Promise.all(
    keys.map(async (key) => [key, await AsyncStorage.getItem(key)]),
  )

  const header = 'key,value'
  const rows = entries.map(([key, value]) => {
    const parsedValue = (() => {
      if (!value) {
        return null
      }

      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    })()

    return `${encodeCsvCell(key)},${encodeCsvCell(parsedValue)}`
  })

  return [header, ...rows].join('\n')
}

export async function clearAllStoredData() {
  await AsyncStorage.clear()
}
