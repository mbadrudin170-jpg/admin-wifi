import { useEffect, useRef, useState } from 'react';
import {
  Button,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
} from 'expo-audio';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

// Player disimpan di globalThis agar tetap hidup saat Fast Refresh/hot reload.
const globalAudio = globalThis as {
  __audioPlayerGlobal?: ReturnType<typeof createAudioPlayer>;
  __audioIdGlobal?: string | null;
  __idDimuat?: string | null;
};

type PlaylistItem = { id: string; filename: string; duration: number };

const globalPlaylist = globalThis as {
  __playlist?: PlaylistItem[];
  __playlistIndex?: number;
};
export function setPlaylist(items: PlaylistItem[], index: number) {
  globalPlaylist.__playlist = items;
  globalPlaylist.__playlistIndex = index;
}

export function getPlaylist() {
  return globalPlaylist.__playlist ?? [];
}

export function getPlaylistIndex() {
  return globalPlaylist.__playlistIndex ?? 0;
}

export function setPlaylistIndex(index: number) {
  globalPlaylist.__playlistIndex = index;
}

function dapatkanPlayer() {
  if (!globalAudio.__audioPlayerGlobal) {
    globalAudio.__audioPlayerGlobal = createAudioPlayer(null);
  }
  return globalAudio.__audioPlayerGlobal;
}

function getIdGlobal() {
  return globalAudio.__audioIdGlobal ?? null;
}

function setIdGlobal(value: string | null) {
  globalAudio.__audioIdGlobal = value;
}

function getIdDimuat() {
  return globalAudio.__idDimuat ?? null;
}

function setIdDimuat(value: string | null) {
  globalAudio.__idDimuat = value;
}

type LirikBaris = { waktu: number; teks: string };

function parseLrc(lrc: string): LirikBaris[] {
  const baris: LirikBaris[] = [];
  for (const line of lrc.split('\n')) {
    const matches = [
      ...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g),
    ];
    const teks = line.replace(/\[[^\]]+\]/g, '').trim();
    if (matches.length === 0) continue;
    for (const m of matches) {
      const menit = parseInt(m[1], 10);
      const detik = parseInt(m[2], 10);
      const fraksiStr = m[3] ?? '0';
      const fraksi =
        fraksiStr.length === 3
          ? parseInt(fraksiStr, 10) / 1000
          : parseInt(fraksiStr, 10) / 100;
      baris.push({ waktu: menit * 60 + detik + fraksi, teks });
    }
  }
  baris.sort((a, b) => a.waktu - b.waktu);
  return baris;
}

function formatWaktu(detik: number) {
  if (!Number.isFinite(detik) || detik < 0) return '0:00';
  const menit = Math.floor(detik / 60);
  const sisa = Math.floor(detik % 60);
  return `${menit}:${sisa.toString().padStart(2, '0')}`;
}

const StatusBarAny = StatusBar as any;

export default function PemutarMusik() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { id, judul } = useLocalSearchParams<{ id?: string; judul?: string }>();
  const playlistAwal = getPlaylist();
  const indeksAwal = getPlaylistIndex();
  const laguAwal = playlistAwal[indeksAwal];
  const [judulAktif, setJudulAktif] = useState(
    laguAwal?.filename ?? judul ?? 'Pemutar Musik',
  );
  const player = dapatkanPlayer();
  const status = useAudioPlayerStatus(player);
  const [lebarProgress, setLebarProgress] = useState(0);

  const scrollRef = useRef<any>(null);
  const lineMetrics = useRef<{ y: number; height: number }[]>([]);
  const lastLirikIndex = useRef<number>(-1);

  const [lirik, setLirik] = useState<LirikBaris[]>([]);
  const [memuatLirik, setMemuatLirik] = useState(false);
  const [pesanLirik, setPesanLirik] = useState<string | null>(null);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    (StatusBar as any).setBackgroundColor?.('black', true);
    (StatusBar as any).setBarStyle?.('light-content', true);
  }, []);

  useEffect(() => {
    let aktif = true;

    const muatSumber = async () => {
      if (!id || id === getIdDimuat()) {
        console.log('PemutarMusik: sumber tidak dimuat ulang', {
          id,
          idDimuat: getIdDimuat(),
        });
        return;
      }
      console.log('PemutarMusik: memuat sumber audio', { id });
      const info = await new MediaLibrary.Asset(id).getInfo();
      if (aktif && info?.uri) {
        console.log('PemutarMusik: URI audio ditemukan', info.uri);
        player.pause();
        player.replace(info.uri);
        setIdGlobal(id);
        setIdDimuat(id);
        player.setActiveForLockScreen(true, { title: judul ?? 'Musik' });
        player.play();
        console.log('PemutarMusik: mulai putar');
      } else {
        console.log('PemutarMusik: URI audio tidak ditemukan');
      }
    };

    void muatSumber();
    return () => {
      aktif = false;
    };
  }, [id, player]);

  useEffect(() => {
    let aktif = true;

    const muatLirik = async () => {
      if (!judulAktif) {
        setLirik([]);
        setPesanLirik(null);
        return;
      }
      setMemuatLirik(true);
      setPesanLirik(null);
      try {
        const namaBersih = (judulAktif ?? '')
          .replace(/\.[^.]+$/, '')
          .replace(/_\d+$/, '')
          .replace(/[_]+/g, ' ')
          .trim();
        const kueri = namaBersih || judul || '';
        const parts = kueri.split(' - ');
        let track = kueri;
        let artist = '';
        if (parts.length >= 2) {
          artist = parts[0].trim();
          track = parts.slice(1).join(' - ').trim();
        }
        track = track.replace(/\([^)]*\)/g, '').trim();

        const buatUrl = (withArtist: boolean) => {
          const params = new URLSearchParams();
          params.set('track_name', track || kueri);
          if (withArtist && artist) params.set('artist_name', artist);
          return `https://lrclib.net/api/search?${params.toString()}`;
        };

        let url = buatUrl(true);
        console.log('PemutarMusik: memuat lirik', url);
        let res = await fetch(url);
        if (!res.ok) throw new Error('Gagal memuat lirik');
        let data = await res.json();
        console.log(
          'PemutarMusik: respons lirik',
          Array.isArray(data) ? data.length : data,
        );

        if ((!Array.isArray(data) || data.length === 0) && artist) {
          const url2 = buatUrl(false);
          console.log('PemutarMusik: coba tanpa artist', url2);
          const res2 = await fetch(url2);
          if (res2.ok) {
            data = await res2.json();
            console.log(
              'PemutarMusik: respons lirik',
              Array.isArray(data) ? data.length : data,
            );
          }
        }

        const item = Array.isArray(data)
          ? (data.find((x: any) => typeof x?.syncedLyrics === 'string') ??
            data.find((x: any) => typeof x?.plainLyrics === 'string'))
          : null;
        if (!item) {
          if (aktif) {
            setLirik([]);
            setPesanLirik('Lirik tidak ditemukan');
          }
          console.log('PemutarMusik: lirik tidak ditemukan');
          return;
        }
        if (typeof item.syncedLyrics === 'string') {
          const baris = parseLrc(item.syncedLyrics);
          if (aktif) setLirik(baris);
          console.log(
            'PemutarMusik: lirik sinkron dimuat',
            baris.length,
            'baris',
          );
        } else if (typeof item.plainLyrics === 'string') {
          const baris = item.plainLyrics
            .split('\n')
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0)
            .map((t: string) => ({ waktu: 0, teks: t }));
          if (aktif) setLirik(baris);
          console.log('PemutarMusik: lirik teks dimuat', baris.length, 'baris');
        } else {
          if (aktif) {
            setLirik([]);
            setPesanLirik('Lirik tidak ditemukan');
          }
        }
      } catch (error) {
        console.log('PemutarMusik: gagal memuat lirik', error);
        if (aktif) {
          setLirik([]);
          setPesanLirik('Gagal memuat lirik');
        }
      } finally {
        if (aktif) setMemuatLirik(false);
      }
    };

    void muatLirik();

    return () => {
      aktif = false;
    };
  }, [judulAktif]);

  useEffect(() => {
    lineMetrics.current = new Array(lirik.length)
      .fill(null)
      .map(() => ({ y: 0, height: 0 }));
    lastLirikIndex.current = -1;
  }, [lirik]);

  useEffect(() => {
    if (lirik.length === 0) return;
    let idx = -1;
    for (let i = 0; i < lirik.length; i++) {
      if (lirik[i].waktu <= status.currentTime) idx = i;
      else break;
    }
    if (idx < 0 || idx === lastLirikIndex.current) return;
    lastLirikIndex.current = idx;
    console.log('PemutarMusik: lirik aktif', idx, lirik[idx]?.teks);
    try {
      scrollRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5,
      });
    } catch {
      // Abaikan jika item belum terukur.
    }
  }, [lirik, status.currentTime]);

  let indeksAktif = -1;
  for (let i = 0; i < lirik.length; i++) {
    if (lirik[i].waktu <= status.currentTime) indeksAktif = i;
    else break;
  }

  useEffect(() => {
    if (!status.didJustFinish) return;
    const daftar = getPlaylist();
    const indeksBerikut = getPlaylistIndex() + 1;
    console.log(
      'PemutarMusik: lagu selesai, indeks berikutnya',
      indeksBerikut,
      'dari',
      daftar.length,
    );
    if (indeksBerikut >= daftar.length) {
      console.log('PemutarMusik: akhir playlist');
      return;
    }

    const berikut = daftar[indeksBerikut];
    setPlaylistIndex(indeksBerikut);

    let aktif = true;
    const muat = async () => {
      setJudulAktif(berikut.filename);
      const info = await new MediaLibrary.Asset(berikut.id).getInfo();
      if (aktif && info?.uri) {
        player.pause();
        player.replace(info.uri);
        setIdGlobal(berikut.id);
        player.setActiveForLockScreen(true, { title: berikut.filename });
        player.play();
      }
    };
    void muat();

    return () => {
      aktif = false;
    };
  }, [status.didJustFinish]);

  const progres =
    status.duration > 0
      ? Math.min(1, Math.max(0, status.currentTime / status.duration))
      : 0;

  const seekKe = (x: number) => {
    if (lebarProgress <= 0 || status.duration <= 0) return;
    const rasio = Math.min(1, Math.max(0, x / lebarProgress));
    const target = rasio * status.duration;
    console.log('PemutarMusik: seek', { x, rasio, target });
    void player.seekTo(target);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <StatusBarAny barStyle="light-content" backgroundColor="black" translucent={false} />
      <ThemedView style={styles.container}>
        <ThemedView>
          <ThemedText>Pemutar Musik</ThemedText>
        </ThemedView>

        <View style={styles.artwork}>
          <ThemedText style={styles.artworkIcon}>♪</ThemedText>
        </View>

        <ThemedText type="title" style={styles.judul} numberOfLines={2}>
          {judulAktif}
        </ThemedText>
        <ThemedText type="small" style={styles.subjudul}>
          {status.isBuffering
            ? 'Memuat...'
            : status.playing
              ? 'Sedang diputar'
              : 'Siap diputar'}
        </ThemedText>

        <View style={styles.progressWrap}>
          <Pressable
            style={[
              styles.progressTrack,
              { backgroundColor: colors.backgroundSelected },
            ]}
            onLayout={(e) => setLebarProgress(e.nativeEvent.layout.width)}
            onPress={(e) => seekKe(e.nativeEvent.locationX)}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progres * 100}%`, backgroundColor: colors.text },
              ]}
            />
          </Pressable>

          <View style={styles.waktuRow}>
            <ThemedText type="small">
              {formatWaktu(status.currentTime)}
            </ThemedText>
            <ThemedText type="small">{formatWaktu(status.duration)}</ThemedText>
          </View>
        </View>

        <View style={styles.kontrol}>
          <Button
            title="Ulang"
            onPress={() => {
              console.log('PemutarMusik: tombol Ulang');
              void player.seekTo(0);
              player.play();
            }}
          />
          <View style={styles.playButton}>
            <Button
              title={status.playing ? 'Jeda' : 'Putar'}
              onPress={() => {
                console.log(
                  'PemutarMusik: tombol',
                  status.playing ? 'Jeda' : 'Putar',
                );
                status.playing ? player.pause() : player.play();
              }}
            />
          </View>
        </View>

        <View style={styles.lirikBox}>
          <ThemedText type="small" style={styles.lirikJudul}>
            Lirik
          </ThemedText>
          {memuatLirik ? (
            <ThemedText type="small" style={styles.lirikInfo}>
              Memuat lirik...
            </ThemedText>
          ) : pesanLirik ? (
            <ThemedText type="small" style={styles.lirikInfo}>
              {pesanLirik}
            </ThemedText>
          ) : lirik.length === 0 ? (
            <ThemedText type="small" style={styles.lirikInfo}>
              Tidak ada lirik
            </ThemedText>
          ) : (
            <FlatList
              ref={scrollRef}
              data={lirik}
              keyExtractor={(_, i) => String(i)}
              style={styles.lirikScroll}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: b, index: i }) => (
                <ThemedText
                  type={i === indeksAktif ? 'default' : 'small'}
                  style={[
                    styles.lirikBaris,
                    i === indeksAktif && styles.lirikAktif,
                  ]}
                >
                  {b.teks || '♪'}
                </ThemedText>
              )}
            />
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.one,
    gap: Spacing.four,
  },
  artwork: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  artworkIcon: {
    fontSize: 64,
  },
  judul: {
    textAlign: 'center',
  },
  subjudul: {
    opacity: 0.7,
    textAlign: 'center',
  },
  progressWrap: {
    width: '100%',
    gap: Spacing.one,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  waktuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kontrol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  playButton: {
    minWidth: 96,
  },
  lirikBox: {
    width: '100%',
    maxHeight: 220,
    gap: Spacing.two,
  },
  lirikJudul: {
    fontWeight: '600',
    opacity: 0.8,
  },
  lirikInfo: {
    textAlign: 'center',
    opacity: 0.6,
  },
  lirikScroll: {
    maxHeight: 180,
  },
  lirikBaris: {
    textAlign: 'center',
    opacity: 0.6,
    paddingVertical: 2,
  },
  lirikAktif: {
    opacity: 1,
    fontWeight: '600',
  },
});
