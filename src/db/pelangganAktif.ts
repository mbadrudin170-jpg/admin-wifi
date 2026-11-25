import { db } from "./database";

export type PelangganAktif = {
  id: number;
  nama: string;
  created_at: string;
};

export function getAllPelangganAktif(): PelangganAktif[] {
  return db.getAllSync<PelangganAktif>("SELECT * FROM pelanggan_aktif ORDER BY id DESC");
}

export function addPelangganAktif(nama: string): void {
  db.runSync("INSERT INTO pelanggan_aktif (nama) VALUES (?)", [nama]);
}

export function updatePelangganAktif(id: number, nama: string): void {
  db.runSync("UPDATE pelanggan_aktif SET nama = ? WHERE id = ?", [nama, id]);
}

export function deletePelangganAktif(id: number): void {
  db.runSync("DELETE FROM pelanggan_aktif WHERE id = ?", [id]);
}
