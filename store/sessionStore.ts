// Zustand store for global state – placeholder implementation.
import create from 'zustand'

interface SessionState {
  activeSession: any | null
  setActiveSession: (session: any | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
}))
