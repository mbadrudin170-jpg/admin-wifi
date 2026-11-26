import { createAudioPlayer } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import { create } from 'zustand';

export type PlaylistItem = {
  id: string;
  filename: string;
  duration: number;
  artwork?: string;
};

type PlayerState = {
  playlist: PlaylistItem[];
  index: number;
  setPlaylist: (items: PlaylistItem[], index: number) => void;
  setIndex: (index: number) => void;

  audioPlayer: ReturnType<typeof createAudioPlayer> | null;
  audioId: string | null;
  idDimuat: string | null;
  setAudioPlayer: (p: ReturnType<typeof createAudioPlayer> | null) => void;
  setAudioId: (id: string | null) => void;
  setIdDimuat: (id: string | null) => void;

  libraryMusik: PlaylistItem[];
  libraryOffset: number;
  isLoadingLibrary: boolean;
  libraryError: string | null;
  hasPermission: boolean | null;
  loadLibrary: () => Promise<void>;
  loadMoreLibrary: () => Promise<void>;
  _setLibrary: (items: PlaylistItem[]) => void;
  _setLibraryLoading: (v: boolean) => void;
  _setLibraryError: (e: string | null) => void;
  _setHasPermission: (v: boolean | null) => void;
  _setLibraryOffset: (v: number) => void;
};

const cariCover = async (namaFile: string): Promise<string | undefined> => {
  if (!namaFile) return undefined;
  try {
    const namaBersih = namaFile
      .replace(/\.[^.]+$/, '')
      .replace(/_\d+$/, '')
      .replace(/[_]+/g, ' ')
      .trim();
    const kueri = namaBersih || namaFile;
    const parts = kueri.split(' - ');
    let track = kueri;
    let artist = '';
    if (parts.length >= 2) {
      artist = parts[0].trim();
      track = parts.slice(1).join(' - ').trim();
    }
    track = track.replace(/\([^)]*\)/g, '').trim();

    const term = encodeURIComponent([artist, track].filter(Boolean).join(' '));
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&limit=1`,
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const item = Array.isArray(data?.results) ? data.results[0] : null;
    return typeof item?.artworkUrl100 === 'string'
      ? item.artworkUrl100.replace('100x100bb', '600x600bb')
      : undefined;
  } catch {
    return undefined;
  }
};

export const usePlayerStore = create<PlayerState>((set) => ({
  playlist: [],
  index: 0,
  setPlaylist: (items, index) => set({ playlist: items, index }),
  setIndex: (index) => set({ index }),

  audioPlayer: null,
  audioId: null,
  idDimuat: null,
  setAudioPlayer: (p) => set({ audioPlayer: p }),
  setAudioId: (id) => set({ audioId: id }),
  setIdDimuat: (id) => set({ idDimuat: id }),

  libraryMusik: [],
  libraryOffset: 0,
  isLoadingLibrary: false,
  libraryError: null,
  hasPermission: null,
  _setLibrary: (items) => set({ libraryMusik: items }),
  _setLibraryLoading: (v) => set({ isLoadingLibrary: v }),
  _setLibraryError: (e) => set({ libraryError: e }),
  _setHasPermission: (v) => set({ hasPermission: v }),
  _setLibraryOffset: (v) => set({ libraryOffset: v }),
  loadLibrary: async () => {
    const state = usePlayerStore.getState();
    state._setLibraryLoading(true);
    state._setLibraryError(null);
    state._setLibraryOffset(0);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        state._setHasPermission(false);
        state._setLibraryError('Izin akses media ditolak');
        state._setLibrary([]);
        state._setLibraryOffset(0);
        return;
      }
      state._setHasPermission(true);
      const hasil = await new MediaLibrary.Query()
        .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.AUDIO)
        .orderBy({
          key: MediaLibrary.AssetField.CREATION_TIME,
          ascending: false,
        })
        .limit(50)
        .offset(0)
        .exeForMetadata();

      const items: PlaylistItem[] = await Promise.all(
        hasil.map(async (item) => ({
          id: item.id,
          filename: item.filename ?? 'Tanpa nama',
          duration: item.duration ?? 0,
          artwork: await cariCover(item.filename ?? ''),
        })),
      );
      state._setLibrary(items);
      state._setLibraryOffset(items.length);
    } catch (error) {
      console.error('Gagal memuat musik lokal:', error);
      state._setLibraryError('Gagal memuat musik');
      state._setLibrary([]);
      state._setLibraryOffset(0);
    } finally {
      state._setLibraryLoading(false);
    }
  },

  loadMoreLibrary: async () => {
    const state = usePlayerStore.getState();
    if (state.isLoadingLibrary || !state.hasPermission) return;

    state._setLibraryLoading(true);
    try {
      const hasil = await new MediaLibrary.Query()
        .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.AUDIO)
        .orderBy({
          key: MediaLibrary.AssetField.CREATION_TIME,
          ascending: false,
        })
        .limit(50)
        .offset(state.libraryOffset)
        .exeForMetadata();

      const items: PlaylistItem[] = await Promise.all(
        hasil.map(async (item) => ({
          id: item.id,
          filename: item.filename ?? 'Tanpa nama',
          duration: item.duration ?? 0,
          artwork: await cariCover(item.filename ?? ''),
        })),
      );

      if (items.length > 0) {
        state._setLibrary([...state.libraryMusik, ...items]);
        state._setLibraryOffset(state.libraryOffset + items.length);
      }
    } catch (error) {
      console.error('Gagal memuat musik lebih lanjut:', error);
    } finally {
      state._setLibraryLoading(false);
    }
  },
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

export function getOrCreateAudioPlayer() {
  const state = usePlayerStore.getState();
  if (!state.audioPlayer) {
    const p = createAudioPlayer(null);
    state.setAudioPlayer(p);
    return p;
  }
  return state.audioPlayer;
}

export function setAudioIdGlobal(value: string | null) {
  usePlayerStore.getState().setAudioId(value);
}

export function getIdDimuatStore() {
  return usePlayerStore.getState().idDimuat;
}

export function setIdDimuatStore(value: string | null) {
  usePlayerStore.getState().setIdDimuat(value);
}

export function loadMoreLibrary() {
  usePlayerStore.getState().loadMoreLibrary();
}
