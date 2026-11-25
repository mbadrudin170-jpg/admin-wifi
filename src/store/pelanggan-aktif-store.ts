import { create } from "zustand";

import { addPelangganAktif, getAllPelangganAktif, PelangganAktif } from "@/db/pelanggan-aktif";

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
