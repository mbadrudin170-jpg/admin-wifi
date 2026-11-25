import { create } from "zustand";

import { addPelangganAktif, getAllPelangganAktif, PelangganAktif } from "@/db/pelangganAktif";

type State = {
  items: PelangganAktif[];
  load: () => void;
  add: (nama: string) => void;
};

export const usePelangganAktifStore = create<State>((set) => ({
  items: [],
  load: () => set({ items: getAllPelangganAktif() }),
  add: (nama) => {
    addPelangganAktif(nama);
    set({ items: getAllPelangganAktif() });
  },
}));
