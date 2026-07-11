import NetInfo from '@react-native-community/netinfo';
import { useOfflineQueueStore } from '../store/offlineQueueStore';
import { apiClient } from '../api/client';
import { logger } from './logger';

const RETRY_DELAY_MS  = 2000;
const MAX_RETRIES     = 3;

let unsubscribe: (() => void) | null = null;

export function startSyncService() {
  if (unsubscribe) return; // already started

  unsubscribe = NetInfo.addEventListener(async (state) => {
    const isOnline = !!state.isConnected && !!state.isInternetReachable;
    useOfflineQueueStore.getState().setOffline(!isOnline);

    if (isOnline) {
      await flushQueue();
    }
  });
}

export function stopSyncService() {
  unsubscribe?.();
  unsubscribe = null;
}

async function flushQueue() {
  const store = useOfflineQueueStore.getState();
  const { queue } = store;

  for (const item of queue) {
    if (item.retries >= MAX_RETRIES) {
      logger.warn('[Sync] Item exceeded max retries — removing', { id: item.id });
      store.dequeue(item.id);
      continue;
    }

    try {
      await replayItem(item);
      store.dequeue(item.id);
      logger.info('[Sync] Replayed queued item', { id: item.id, type: item.type });
    } catch (err) {
      store.incrementRetry(item.id);
      logger.warn('[Sync] Replay failed — will retry', { id: item.id, retries: item.retries + 1 });
      await sleep(RETRY_DELAY_MS * Math.pow(2, item.retries));
    }
  }
}

async function replayItem(item: { type: string; payload: Record<string, unknown> }) {
  switch (item.type) {
    case 'discussion_reply': {
      const { threadId, body } = item.payload as { threadId: string; body: string };
      await apiClient.post(`/discussions/${threadId}/replies`, { body });
      break;
    }
    case 'custom_request': {
      await apiClient.post('/custom-requests', item.payload);
      break;
    }
    case 'bookmark': {
      const { contentType, contentId } = item.payload as { contentType: string; contentId: string };
      await apiClient.post(`/${contentType}/${contentId}/bookmark`);
      break;
    }
    default:
      logger.warn('[Sync] Unknown queue item type', { type: item.type });
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
