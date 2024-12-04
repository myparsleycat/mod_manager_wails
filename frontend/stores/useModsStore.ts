// stores/useModsStore.ts
import { create } from 'zustand'
import { fs } from '@/wailsjs/wailsjs/go/models'

interface ModsState {
  dirs: fs.ModFolder[]
  isLoading: boolean
  setDirs: (dirs: fs.ModFolder[]) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useModsStore = create<ModsState>((set) => ({
  dirs: [],
  isLoading: false,
  setDirs: (dirs) => set({ dirs }),
  setIsLoading: (isLoading) => set({ isLoading })
}))