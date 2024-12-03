import { create } from 'zustand'

interface AlertDialogState {
  alert: {
    title: string;
    description: string;
  }
  isOpen: boolean;
  setAlert: (alert: { title: string; description: string }) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useAlertDialog = create<AlertDialogState>((set) => ({
  alert: {
    title: "",
    description: ""
  },
  isOpen: false,
  setAlert: (alert) => set((state) => ({
    alert,
    isOpen: !!(alert.title || alert.description)
  })),
  setIsOpen: (isOpen) => set({ isOpen })
}))