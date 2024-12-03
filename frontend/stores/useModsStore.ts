// stores/useModsStore.ts
import { create } from 'zustand'

interface ModsState {
  dirs: string[]
  isLoading: boolean
  setDirs: (dirs: string[]) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useModsStore = create<ModsState>((set) => ({
  dirs: [],
  isLoading: false,
  setDirs: (dirs) => set({ dirs }),
  setIsLoading: (isLoading) => set({ isLoading })
}))