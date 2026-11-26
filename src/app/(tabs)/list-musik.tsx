import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Spacing } from '@/constants/theme';
import { router } from 'expo-router';
import { setPlaylist } from '../pemutar-musik';
import AppBar from '@/components/app-bar';

type MusikLokal = {
  id: string;
  filename: string;
  duration: number;
};

export default function ListMusik() {
  const [musik, setMusik] = useState<MusikLokal[]>([]);
  const [izin, setIzin] = useState<boolean | null>(null);
  const [memuat, setMemuat] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let aktif = true;

    const muatMusik = async () => {
      try {
        setMemuat(true);
        const permission = await MediaLibrary.requestPermissionsAsync();
        if (!permission.granted) {
          if (aktif) setIzin(false);
          return;
        }
        if (aktif) setIzin(true);

        const hasil = await new MediaLibrary.Query()
          .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.AUDIO)
          .orderBy({
            key: MediaLibrary.AssetField.CREATION_TIME,
            ascending: false,
          })
          .limit(200)
          .exeForMetadata();

        if (aktif) {
          setMusik(
            hasil.map((item) => ({
              id: item.id,
              filename: item.filename ?? 'Tanpa nama',
              duration: item.duration ?? 0,
            })),
          );
        }
      } catch (error) {
        console.error('Gagal memuat musik lokal:', error);
      } finally {
        if (aktif) setMemuat(false);
      }
    };

    void muatMusik();

    return () => {
      aktif = false;
    };
  }, []);

  const formatDurasi = (detik: number) => {
    const menit = Math.floor(detik / 60);
    const sisa = Math.floor(detik % 60);
    return `${menit}:${sisa.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <AppBar
        style={{
          paddingTop: 8 + insets.top,
          paddingBottom: Spacing.two,
          justifyContent: 'center',
        }}
      >
        <ThemedText>Daftar Lagu</ThemedText>
      </AppBar>
      <ThemedView style={styles.card}>
        {izin === false ? (
          <ThemedText type="small" style={styles.empty}>
            Izin akses media ditolak
          </ThemedText>
        ) : memuat ? (
          <ThemedText type="small" style={styles.empty}>
            Memuat musik...
          </ThemedText>
        ) : (
          <FlatList
            data={musik}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" style={styles.empty}>
                Tidak ada musik ditemukan
              </ThemedText>
            }
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  setPlaylist(musik, index);
                  router.push({
                    pathname: '/pemutar-musik',
                    params: { id: item.id, judul: item.filename },
                  });
                }}
              >
                <ThemedText type="default" style={styles.nama}>
                  {item.filename}
                </ThemedText>
                <ThemedText type="small" style={styles.meta}>
                  Durasi {formatDurasi(item.duration)}
                </ThemedText>
              </Pressable>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    paddingHorizontal: Spacing.two,
    gap: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
  },
  row: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: Spacing.one,
  },
  nama: {
    fontWeight: '600',
  },
  meta: {
    opacity: 0.7,
  },
  empty: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: Spacing.three,
  },
});
