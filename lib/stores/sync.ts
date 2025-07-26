import { create } from 'zustand';
import { SyncQueue } from '../storage/mmkv';

interface SyncState {
  isOnline: boolean;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  pendingChanges: number;
}

interface SyncActions {
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  updateLastSyncTime: () => void;
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;
  resetPendingChanges: () => void;
}

export const useSyncStore = create<SyncState & SyncActions>((set) => ({
  isOnline: true,
  lastSyncTime: null,
  syncInProgress: false,
  pendingChanges: 0,

  setOnlineStatus: (isOnline) => set({ isOnline }),

  setSyncInProgress: (syncInProgress) => set({ syncInProgress }),

  updateLastSyncTime: () => set({ lastSyncTime: new Date() }),

  incrementPendingChanges: () => 
    set((state) => ({ pendingChanges: state.pendingChanges + 1 })),

  decrementPendingChanges: () => 
    set((state) => ({ 
      pendingChanges: Math.max(0, state.pendingChanges - 1) 
    })),

  resetPendingChanges: () => set({ pendingChanges: 0 }),

  // Update pending changes count from actual queue size
  updatePendingChangesFromQueue: () => {
    const queueSize = SyncQueue.getQueueSize();
    set({ pendingChanges: queueSize });
  },
}));