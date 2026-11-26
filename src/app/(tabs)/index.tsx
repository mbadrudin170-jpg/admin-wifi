import { useCallback, useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import AppBar from '@/components/app-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePlayerStore } from '@/store/player-store';
import { router } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { setPlaylist } from '../pemutar-musik';

const viewabilityConfig = {
  itemVisiblePercentThreshold: 1,
};

export default function ListMusik() {
  const musik = usePlayerStore((s) => s.libraryMusik);
  const izin = usePlayerStore((s) => s.hasPermission);
  const memuat = usePlayerStore((s) => s.isLoadingLibrary);
  const loadLibrary = usePlayerStore((s) => s.loadLibrary);
  const loadMore = usePlayerStore((s) => s.loadMoreLibrary);
  const insets = useSafeAreaInsets();

  const loadMoreLock = useRef(false);

  const paginationRef = useRef({
    length: musik.length,
    memuat,
    loadMore,
  });

  useEffect(() => {
    paginationRef.current = {
      length: musik.length,
      memuat,
      loadMore,
    };
  }, [musik, memuat, loadMore]);

  const onViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: { index: number | undefined; isViewable: boolean }[];
    }) => {
      const {
        length,
        memuat: sedangMemuat,
        loadMore: muatLagi,
      } = paginationRef.current;

      if (sedangMemuat || length === 0 || loadMoreLock.current) {
        return;
      }

      const itemTerakhirTerlihat = viewableItems.some(
        (item) =>
          item.isViewable &&
          item.index !== undefined &&
          item.index === length - 1,
      );

      if (!itemTerakhirTerlihat) return;

      loadMoreLock.current = true;

      void Promise.resolve(muatLagi()).then(
        () => {
          loadMoreLock.current = false;
        },
        (error) => {
          loadMoreLock.current = false;
          console.error('Gagal memuat musik berikutnya:', error);
        },
      );
    },
    [], // read from refs only; refs don't trigger re-render
  );

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

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
        ) : (
          <FlatList
            data={musik}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText type="small" style={styles.empty}>
                {memuat ? 'Memuat musik...' : 'Tidak ada musik ditemukan'}
              </ThemedText>
            }
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            ListFooterComponent={
              memuat && musik.length > 0 ? (
                <ThemedText type="small" style={styles.empty}>
                  Memuat lebih banyak...
                </ThemedText>
              ) : undefined
            }
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  setPlaylist(musik, index);
                  router.push('/pemutar-musik');
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
