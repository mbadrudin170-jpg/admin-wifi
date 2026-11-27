// src/utils/format.ts
// Utilitas pemformatan waktu, tanggal, tanggal & waktu, dan uang.

export type NilaiTanggal = Date | string | number;

function keTanggal(nilai: NilaiTanggal): Date {
  if (nilai instanceof Date) return nilai;
  return new Date(nilai);
}

const localeId = 'id-ID';

export function formatWaktu(nilai: NilaiTanggal): string {
  const tanggal = keTanggal(nilai);
  return new Intl.DateTimeFormat(localeId, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(tanggal);
}

export function formatTanggal(nilai: NilaiTanggal): string {
  const tanggal = keTanggal(nilai);
  return new Intl.DateTimeFormat(localeId, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(tanggal);
}

export function formatTanggalWaktu(nilai: NilaiTanggal): string {
  const tanggal = keTanggal(nilai);
  return new Intl.DateTimeFormat(localeId, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(tanggal);
}

export type OpsiFormatUang = {
  /** Kode mata uang (default: IDR). */
  mataUang?: string;
  /** Jumlah digit desimal (default: 0). */
  desimal?: number;
  /** Locale pemformatan (default: id-ID). */
  locale?: string;
};

export function formatDurasi(detik: number): string {
  if (!Number.isFinite(detik) || detik < 0) return '0:00';
  const menit = Math.floor(detik / 60);
  const sisa = Math.floor(detik % 60);
  return `${menit}:${sisa.toString().padStart(2, '0')}`;
}
export function formatUang(nilai: number, opsi: OpsiFormatUang = {}): string {
  const { mataUang = 'IDR', desimal = 0, locale = localeId } = opsi;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: mataUang,
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(nilai);
}
