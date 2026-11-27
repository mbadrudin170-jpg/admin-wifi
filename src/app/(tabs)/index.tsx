import AppBar from '@/components/app-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  PlaylistItem,
  setPlaylist,
  usePlayerStore,
} from '@/store/player-store';
import { formatDurasi } from '@/utils/format';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const viewabilityConfig = {
  itemVisiblePercentThreshold: 1,
};

export default function ListMusik() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<PlaylistItem | null>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const musik = usePlayerStore((s) => s.libraryMusik);
  const izin = usePlayerStore((s) => s.hasPermission);
  const memuat = usePlayerStore((s) => s.isLoadingLibrary);
  const loadLibrary = usePlayerStore((s) => s.loadLibrary);
  const loadMore = usePlayerStore((s) => s.loadMoreLibrary);
  const insets = useSafeAreaInsets();
  const loadMoreLock = useRef(false);
  const iconColor = isDark ? '#fff' : '#030000';
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
            initialNumToRender={12}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={false}
            updateCellsBatchingPeriod={50}
            ListFooterComponent={
              memuat && musik.length > 0 ? (
                <ThemedText type="small" style={styles.empty}>
                  Memuat lebih banyak...
                </ThemedText>
              ) : undefined
            }
            renderItem={({ item, index }) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: Spacing.one,
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    style={styles.row}
                    onPress={() => {
                      setPlaylist(musik, index);
                      router.push('/pemutar-musik');
                    }}
                  >
                    <View style={styles.albumArtContainer}>
                      {item.artwork ? (
                        <Image
                          source={{ uri: item.artwork }}
                          style={styles.albumArt}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      ) : (
                        <View
                          style={[styles.albumArt, styles.albumArtPlaceholder]}
                        />
                      )}
                    </View>
                    <View style={styles.textContainer}>
                      <ThemedText type="default" style={styles.nama}>
                        {item.filename}
                      </ThemedText>
                      <ThemedText type="small" style={styles.meta}>
                        Durasi {formatDurasi((item.duration ?? 0) / 1000)}
                      </ThemedText>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setSelected(item);
                      setModalVisible(true);
                    }}
                  >
                    <MaterialIcons
                      name="more-vert"
                      color={iconColor}
                      size={24}
                    />
                  </Pressable>
                </View>
              );
            }}
          />
        )}

        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          onSwipeComplete={() => setModalVisible(false)}
          swipeDirection="down"
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setModalVisible(false)}
          >
            <Pressable
              style={
                (styles.menu, { backgroundColor: isDark ? '#222' : '#fff' })
              }
            >
              <ThemedText>tes</ThemedText>
            </Pressable>
          </Pressable>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: Spacing.one,
    flex: 1,
  },
  albumArtContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  textContainer: {
    flex: 1,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  menu: {
    borderRadius: 8,
    padding: Spacing.two,
    minWidth: 180,
  },
});
