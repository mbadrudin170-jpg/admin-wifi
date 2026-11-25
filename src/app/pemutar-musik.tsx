import { useEffect, useState } from 'react';
import { Button, Pressable, StyleSheet, View } from 'react-native';
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

// Player disimpan di globalThis agar tetap hidup saat Fast Refresh/hot reload
// mereset scope modul, sehingga tidak terbentuk player ganda.
const globalAudio = globalThis as {
  __audioPlayerGlobal?: ReturnType<typeof createAudioPlayer>;
  __audioIdGlobal?: string | null;
};

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

function formatWaktu(detik: number) {
  if (!Number.isFinite(detik) || detik < 0) return '0:00';
  const menit = Math.floor(detik / 60);
  const sisa = Math.floor(detik % 60);
  return `${menit}:${sisa.toString().padStart(2, '0')}`;
}

export default function PemutarMusik() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { id, judul } = useLocalSearchParams<{ id?: string; judul?: string }>();
  const player = dapatkanPlayer();
  const status = useAudioPlayerStatus(player);
  const [lebarProgress, setLebarProgress] = useState(0);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    let aktif = true;

    const muatSumber = async () => {
      if (!id || id === getIdGlobal()) return;
      const info = await new MediaLibrary.Asset(id).getInfo();
      if (aktif && info?.uri) {
        player.pause();
        player.replace(info.uri);
        setIdGlobal(id);
        player.setActiveForLockScreen(true, { title: judul ?? 'Musik' });
        player.play();
      }
    };

    void muatSumber();

    return () => {
      aktif = false;
    };
  }, [id, judul, player]);

  const progres =
    status.duration > 0
      ? Math.min(1, Math.max(0, status.currentTime / status.duration))
      : 0;

  const seekKe = (x: number) => {
    if (lebarProgress <= 0 || status.duration <= 0) return;
    const rasio = Math.min(1, Math.max(0, x / lebarProgress));
    void player.seekTo(rasio * status.duration);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.artwork}>
          <ThemedText style={styles.artworkIcon}>♪</ThemedText>
        </View>

        <ThemedText type="title" style={styles.judul} numberOfLines={2}>
          {judul ?? 'Pemutar Musik'}
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
              void player.seekTo(0);
              player.play();
            }}
          />
          <View style={styles.playButton}>
            <Button
              title={status.playing ? 'Jeda' : 'Putar'}
              onPress={() => (status.playing ? player.pause() : player.play())}
            />
          </View>
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
    padding: Spacing.four,
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
});
