import { create } from 'zustand'

export const useUIStore = create((set) => ({
  role: 'Admin',
  isAuthenticated: false,
  loginStep: 'id',
  activeUserId: null,
  darkMode: false,
  commandOpen: false,
  dispenseModalOpen: false,
  cabinetModalOpen: false,
  sideEffectsModalOpen: false,
  loading: true,
  toasts: [{ id: 1, title: 'Inventory sync complete', text: 'Batch #Q882 was reconciled 2m ago.' }],
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoginStep: (loginStep) => set({ loginStep }),
  setActiveUserId: (activeUserId) => set({ activeUserId }),
  setRole: (role) => set({ role }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setDispenseModalOpen: (dispenseModalOpen) => set({ dispenseModalOpen }),
  setCabinetModalOpen: (cabinetModalOpen) => set({ cabinetModalOpen }),
  setSideEffectsModalOpen: (sideEffectsModalOpen) => set({ sideEffectsModalOpen }),
  setLoading: (loading) => set({ loading }),
  addToast: (title, text) =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now(), title, text }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
