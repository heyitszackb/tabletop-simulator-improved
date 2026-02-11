import { create } from "zustand";

interface Toast {
  id: number;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));

    // Auto-remove after 2.5 seconds
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2500);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));
