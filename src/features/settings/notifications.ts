import * as Notifications from 'expo-notifications'

import { getItem, setItem } from '@/lib/storage'
import { enqueueSyncAction } from '@/lib/sync'

const REMINDER_KEY = 'settings:reminders:v1'

export type ReminderType = 'workout' | 'readiness' | 'recovery'

export type ReminderConfig = {
  enabled: boolean
  hour: number
  minute: number
  title: string
  body: string
  localVersion: number
  notificationId?: string
}

export type ReminderMap = Record<ReminderType, ReminderConfig>

const defaultReminders: ReminderMap = {
  workout: {
    enabled: true,
    hour: 7,
    minute: 0,
    title: 'Workout reminder',
    body: 'Time to train. Open DAHR and start your session.',
    localVersion: 1,
  },
  readiness: {
    enabled: true,
    hour: 8,
    minute: 30,
    title: 'Readiness check-in',
    body: 'Log your sleep, soreness, stress, and motivation before training.',
    localVersion: 1,
  },
  recovery: {
    enabled: true,
    hour: 19,
    minute: 0,
    title: 'Recovery day prompt',
    body: 'Recovery still counts—hydrate, walk, and prep for tomorrow.',
    localVersion: 1,
  },
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

async function requestPermission() {
  const existing = await Notifications.getPermissionsAsync()
  if (existing.granted) {
    return true
  }

  const next = await Notifications.requestPermissionsAsync()
  return next.granted
}

export async function getNotificationPermissionSummary() {
  const status = await Notifications.getPermissionsAsync()

  if (status.granted) {
    return 'Allowed: reminders can be scheduled on-device.'
  }

  if (status.canAskAgain) {
    return 'Not granted yet: we will ask only when you enable reminders.'
  }

  return 'Denied: enable notifications in system settings to receive reminders.'
}

export async function getReminderMap() {
  const stored = await getItem<ReminderMap>(REMINDER_KEY)
  return stored ?? defaultReminders
}

export async function setReminderEnabled(reminderType: ReminderType, enabled: boolean) {
  const reminders = await getReminderMap()
  const reminder = reminders[reminderType]

  reminders[reminderType] = {
    ...reminder,
    enabled,
    localVersion: reminder.localVersion + 1,
  }

  await setItem(REMINDER_KEY, reminders)
  await enqueueSyncAction({
    type: 'notification.preference.updated',
    entityKey: `reminder:${reminderType}`,
    localVersion: reminders[reminderType].localVersion,
    payload: reminders[reminderType],
  })

  return reminders
}

export async function setupLocalNotifications() {
  const permitted = await requestPermission()
  if (!permitted) {
    throw new Error('Notification permission denied.')
  }

  const reminders = await getReminderMap()

  for (const reminderType of Object.keys(reminders) as ReminderType[]) {
    const reminder = reminders[reminderType]

    if (reminder.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId)
    }

    if (!reminder.enabled) {
      reminders[reminderType] = {
        ...reminder,
        notificationId: undefined,
      }
      continue
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    })

    const nextVersion = reminder.localVersion + 1
    reminders[reminderType] = {
      ...reminder,
      localVersion: nextVersion,
      notificationId,
    }

    await enqueueSyncAction({
      type: 'notification.schedule.updated',
      entityKey: `reminder:${reminderType}`,
      localVersion: nextVersion,
      payload: reminders[reminderType],
    })
  }

  await setItem(REMINDER_KEY, reminders)
  return reminders
}
