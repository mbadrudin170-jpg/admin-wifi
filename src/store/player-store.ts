import { create } from 'zustand';

/** Item playlist: id aset MediaLibrary, nama file, durasi detik. */
export type PlaylistItem = { id: string; filename: string; duration: number };

type PlayerState = {
  /** Daftar lagu yang antre diputar. */
  playlist: PlaylistItem[];
  /** Index lagu yang sedang aktif (0-based). */
  index: number;
  /** Ganti seluruh playlist & set index awal. */
  setPlaylist: (items: PlaylistItem[], index: number) => void;
  /** Ubah index lagu aktif (mis. next/prev). */
  setIndex: (index: number) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  playlist: [],
  index: 0,
  /** Action internal: replace playlist & index. */
  setPlaylist: (items, index) => set({ playlist: items, index }),
  /** Action internal: ganti index saja. */
  setIndex: (index) => set({ index }),
}));

/** Helper: set playlist dari luar (list-musik.tsx). */
export function setPlaylist(items: PlaylistItem[], index: number) {
  usePlayerStore.getState().setPlaylist(items, index);
}

/** Helper: ambil playlist saat ini (non-reactive, untuk logic async). */
export function getPlaylist() {
  return usePlayerStore.getState().playlist;
}

/** Helper: ambil index aktif saat ini (non-reactive). */
export function getPlaylistIndex() {
  return usePlayerStore.getState().index;
}

/** Helper: set index playlist (auto-advance, skip-next/prev). */
export function setPlaylistIndex(index: number) {
  usePlayerStore.getState().setIndex(index);
}
