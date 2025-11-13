import { create } from 'zustand'

interface Toast {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UIState {
  toasts: Toast[]
  isStakeModalOpen: boolean
  selectedTier: number | null
  
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  openStakeModal: (tier: number) => void
  closeStakeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isStakeModalOpen: false,
  selectedTier: null,
  
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now().toString() }],
    })),
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  openStakeModal: (tier) => set({ isStakeModalOpen: true, selectedTier: tier }),
  
  closeStakeModal: () => set({ isStakeModalOpen: false, selectedTier: null }),
}))
