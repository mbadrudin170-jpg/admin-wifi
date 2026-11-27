/// <reference types="jest" />
import { formatDurasi } from './format';

describe('formatDurasi', () => {
  it('0 detik', () => expect(formatDurasi(0)).toBe('0:00'));
  it('5 detik', () => expect(formatDurasi(5)).toBe('0:05'));
  it('60 detik', () => expect(formatDurasi(60)).toBe('1:00'));
  it('125 detik', () => expect(formatDurasi(125)).toBe('2:05'));
  it('3599 detik', () => expect(formatDurasi(3599)).toBe('59:59'));
  it('NaN', () => expect(formatDurasi(NaN)).toBe('0:00'));
  it('negatif', () => expect(formatDurasi(-10)).toBe('0:00'));
});
