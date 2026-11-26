import { create } from 'zustand';
import * as MediaLibrary from 'expo-media-library';
import { createAudioPlayer } from 'expo-audio';

export type PlaylistItem = { id: string; filename: string; duration: number };

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
  isLoadingLibrary: boolean;
  libraryError: string | null;
  hasPermission: boolean | null;
  loadLibrary: () => Promise<void>;
  _setLibrary: (items: PlaylistItem[]) => void;
  _setLibraryLoading: (v: boolean) => void;
  _setLibraryError: (e: string | null) => void;
  _setHasPermission: (v: boolean | null) => void;
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
  isLoadingLibrary: false,
  libraryError: null,
  hasPermission: null,
  _setLibrary: (items) => set({ libraryMusik: items }),
  _setLibraryLoading: (v) => set({ isLoadingLibrary: v }),
  _setLibraryError: (e) => set({ libraryError: e }),
  _setHasPermission: (v) => set({ hasPermission: v }),
  loadLibrary: async () => {
    const state = usePlayerStore.getState();
    state._setLibraryLoading(true);
    state._setLibraryError(null);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        state._setHasPermission(false);
        state._setLibraryError('Izin akses media ditolak');
        state._setLibrary([]);
        return;
      }
      state._setHasPermission(true);
      const hasil = await new MediaLibrary.Query()
        .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.AUDIO)
        .orderBy({
          key: MediaLibrary.AssetField.CREATION_TIME,
          ascending: false,
        })
        .limit(200)
        .exeForMetadata();

      const items: PlaylistItem[] = hasil.map((item) => ({
        id: item.id,
        filename: item.filename ?? 'Tanpa nama',
        duration: item.duration ?? 0,
      }));
      state._setLibrary(items);
    } catch (error) {
      console.error('Gagal memuat musik lokal:', error);
      state._setLibraryError('Gagal memuat musik');
      state._setLibrary([]);
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
