import { create } from 'zustand';

export type PlaylistItem = { id: string; filename: string; duration: number };

type PlayerState = {
  playlist: PlaylistItem[];
  index: number;
  setPlaylist: (items: PlaylistItem[], index: number) => void;
  setIndex: (index: number) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  playlist: [],
  index: 0,
  setPlaylist: (items, index) => set({ playlist: items, index }),
  setIndex: (index) => set({ index }),
}));

export function setPlaylist(items: PlaylistItem[], index: number) {
  usePlayerStore.getState().setPlaylist(items, index);
}

export function getPlaylist() {
  return usePlayerStore.getState().playlist;
}

export function getPlaylistIndex() {
  return usePlayerStore.getState().index;
}

export function setPlaylistIndex(index: number) {
  usePlayerStore.getState().setIndex(index);
}
