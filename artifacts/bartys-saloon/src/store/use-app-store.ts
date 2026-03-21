import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  audioEnabled: boolean;
  toggleAudio: () => void;
  activeConversationId: number | null;
  setActiveConversation: (id: number | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      audioEnabled: true,
      toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
      activeConversationId: null,
      setActiveConversation: (id) => set({ activeConversationId: id }),
    }),
    {
      name: 'bartys-saloon-storage',
    }
  )
);
