import { getItem, setItem } from '@/lib/storage';

import type { SyncAction, SyncActionStatus, SyncQueueState, SyncActionType } from './types';

const SYNC_QUEUE_KEY = 'sync:queue:v1';

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readState(): Promise<SyncQueueState> {
  const stored = await getItem<SyncQueueState>(SYNC_QUEUE_KEY);
  if (!stored) {
    return { actions: [] };
  }

  return {
    actions: stored.actions ?? [],
    lastSyncAt: stored.lastSyncAt,
  };
}

async function writeState(state: SyncQueueState) {
  await setItem(SYNC_QUEUE_KEY, state);
}

export async function enqueueSyncAction<TPayload extends Record<string, unknown> = Record<string, unknown>>(params: {
  type: SyncActionType;
  entityKey: string;
  localVersion: number;
  payload: TPayload;
}) {
  const state = await readState();
  const timestamp = nowIso();

  const existingIndex = state.actions.findIndex(
    (action) => action.entityKey === params.entityKey && action.type === params.type,
  );

  const incoming: SyncAction<TPayload> = {
    id: makeId(),
    type: params.type,
    entityKey: params.entityKey,
    localVersion: params.localVersion,
    payload: params.payload,
    createdAt: timestamp,
    updatedAt: timestamp,
    status: 'pending',
    attempts: 0,
  };

  if (existingIndex >= 0) {
    const existing = state.actions[existingIndex];
    if (existing && existing.localVersion > incoming.localVersion) {
      return existing;
    }

    state.actions[existingIndex] = {
      ...incoming,
      id: existing?.id ?? incoming.id,
      createdAt: existing?.createdAt ?? incoming.createdAt,
    };
  } else {
    state.actions.push(incoming);
  }

  await writeState(state);
  return incoming;
}

export async function updateSyncActionStatus(
  actionId: string,
  status: SyncActionStatus,
  options?: { attempts?: number; nextRetryAt?: string; lastError?: string },
) {
  const state = await readState();
  const nextActions = state.actions.map((action) => {
    if (action.id !== actionId) {
      return action;
    }

    return {
      ...action,
      status,
      updatedAt: nowIso(),
      attempts: options?.attempts ?? action.attempts,
      nextRetryAt: options?.nextRetryAt,
      lastError: options?.lastError,
    };
  });

  await writeState({ ...state, actions: nextActions });
}

export async function removeSyncAction(actionId: string) {
  const state = await readState();
  await writeState({ ...state, actions: state.actions.filter((action) => action.id !== actionId) });
}

export async function markSyncCompleted(timestamp = nowIso()) {
  const state = await readState();
  await writeState({ ...state, lastSyncAt: timestamp });
}

export async function getSyncQueueState() {
  return readState();
}
