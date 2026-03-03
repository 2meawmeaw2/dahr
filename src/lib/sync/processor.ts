import {
  getSyncQueueState,
  markSyncCompleted,
  removeSyncAction,
  updateSyncActionStatus,
} from './queue';
import type { SyncTransport } from './types';

const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 5_000;

function computeRetryDelayMs(attempts: number) {
  const exponential = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attempts - 1);
  const capped = Math.min(exponential, 5 * 60 * 1000);
  const jitter = Math.floor(Math.random() * 500);
  return capped + jitter;
}

function canRetry(nextRetryAt?: string) {
  if (!nextRetryAt) {
    return true;
  }

  return Date.parse(nextRetryAt) <= Date.now();
}

export async function processSyncQueue(transport: SyncTransport) {
  const state = await getSyncQueueState();
  const actionable = state.actions
    .filter((action) => action.status !== 'in_progress' && canRetry(action.nextRetryAt))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));

  if (actionable.length === 0) {
    return state;
  }

  for (const action of actionable) {
    await updateSyncActionStatus(action.id, 'in_progress', { attempts: action.attempts });

    const result = await transport(action);
    if (result.ok) {
      await removeSyncAction(action.id);
      continue;
    }

    const nextAttempts = action.attempts + 1;
    if (!result.retriable || nextAttempts >= MAX_RETRY_ATTEMPTS) {
      await updateSyncActionStatus(action.id, 'failed', {
        attempts: nextAttempts,
        lastError: result.message,
      });
      continue;
    }

    const nextRetryAt = new Date(Date.now() + computeRetryDelayMs(nextAttempts)).toISOString();
    await updateSyncActionStatus(action.id, 'pending', {
      attempts: nextAttempts,
      nextRetryAt,
      lastError: result.message,
    });
  }

  await markSyncCompleted();
  return getSyncQueueState();
}
