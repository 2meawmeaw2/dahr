import { processSyncQueue, type SyncAction, type SyncResult } from '@/lib/sync';

function isOnline() {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

async function fakeRemoteTransport(action: SyncAction): Promise<SyncResult> {
  if (!isOnline()) {
    return {
      ok: false,
      retriable: true,
      message: 'Device offline. Will retry when online.',
    };
  }

  if (!action.payload) {
    return {
      ok: false,
      retriable: false,
      message: 'Invalid payload.',
    };
  }

  return { ok: true };
}

export async function syncPendingSettingsActions() {
  return processSyncQueue(fakeRemoteTransport);
}
