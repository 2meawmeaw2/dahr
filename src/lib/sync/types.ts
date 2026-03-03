export type SyncActionType =
  | 'notification.preference.updated'
  | 'notification.schedule.updated'
  | 'notification.event.logged';

export type SyncActionStatus = 'pending' | 'in_progress' | 'failed';

export type SyncAction<TPayload = Record<string, unknown>> = {
  id: string;
  type: SyncActionType;
  entityKey: string;
  localVersion: number;
  payload: TPayload;
  createdAt: string;
  updatedAt: string;
  status: SyncActionStatus;
  attempts: number;
  nextRetryAt?: string;
  lastError?: string;
};

export type SyncQueueState = {
  actions: SyncAction[];
  lastSyncAt?: string;
};

export type SyncResult = {
  ok: true;
} | {
  ok: false;
  retriable: boolean;
  message: string;
};

export type SyncTransport = (action: SyncAction) => Promise<SyncResult>;
