import { create } from "zustand";

import { addPelangganAktif, getAllPelangganAktif, PelangganAktif, PelangganAktifBaru } from "@/db/pelanggan-aktif";

type State = {
  items: PelangganAktif[];
  load: () => void;
  add: (data: PelangganAktifBaru) => void;
};

export const usePelangganAktifStore = create<State>((set) => ({
  items: [],
  load: () => set({ items: getAllPelangganAktif() }),
  add: (data) => {
    addPelangganAktif(data);
    set({ items: getAllPelangganAktif() });
  },
}));
