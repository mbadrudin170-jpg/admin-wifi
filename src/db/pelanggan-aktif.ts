import { db } from './database';

import { v4 as uuidv4 } from 'uuid';

export type PelangganAktif = {
  id: string;
  nama: string;
  created_at: string;
};

// Skema untuk data baru (id & created_at diisi oleh DB/aplikasi)
export type PelangganAktifBaru = {
  nama: string;
};

export function getAllPelangganAktif(): PelangganAktif[] {
  return db.getAllSync<PelangganAktif>(
    'SELECT * FROM pelanggan_aktif ORDER BY created_at DESC',
  );
}

export function addPelangganAktif(data: PelangganAktifBaru): void {
  const id = uuidv4();
  db.runSync('INSERT INTO pelanggan_aktif (id, nama) VALUES (?, ?)', [
    id,
    data.nama,
  ]);
}

export function updatePelangganAktif(id: number, nama: string): void {
  db.runSync('UPDATE pelanggan_aktif SET nama = ? WHERE id = ?', [nama, id]);
}

export function deletePelangganAktif(id: number): void {
  db.runSync('DELETE FROM pelanggan_aktif WHERE id = ?', [id]);
}
