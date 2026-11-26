import { create } from 'zustand';
import { ReactNode } from 'react';

type OverlayState = {
  visible: boolean;
  children: ReactNode | null;
  show: (children: ReactNode) => void;
  hide: () => void;
  setVisible: (v: boolean) => void;
};

export const useOverlayStore = create<OverlayState>((set) => ({
  visible: false,
  children: null,
  show: (children) => set({ visible: true, children }),
  hide: () => set({ visible: false, children: null }),
  setVisible: (v) => set({ visible: v }),
}));
