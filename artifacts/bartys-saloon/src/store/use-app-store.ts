import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RemedyData {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  emoji: string;
}

interface AppState {
  audioEnabled: boolean;
  toggleAudio: () => void;
  activeConversationId: number | null;
  setActiveConversation: (id: number | null) => void;
  currentSessionId: number | null;
  setCurrentSessionId: (id: number | null) => void;
  currentRemedy: RemedyData | null;
  setCurrentRemedy: (remedy: RemedyData | null) => void;
  isUpdatingRemedy: boolean;
  setIsUpdatingRemedy: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      audioEnabled: true,
      toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),
      activeConversationId: null,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      currentSessionId: null,
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      currentRemedy: null,
      setCurrentRemedy: (remedy) => set({ currentRemedy: remedy }),
      isUpdatingRemedy: false,
      setIsUpdatingRemedy: (v) => set({ isUpdatingRemedy: v }),
    }),
    {
      name: 'bartys-saloon-storage',
    }
  )
);
