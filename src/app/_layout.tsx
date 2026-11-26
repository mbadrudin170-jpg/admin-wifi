import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useOverlayStore } from '@/store/overlay-store';
import {
  getOrCreateAudioPlayer,
  getPlaylist,
  getPlaylistIndex,
  setPlaylistIndex,
} from '@/store/player-store';
import * as MediaLibrary from 'expo-media-library';
import { NavigationBar } from 'expo-navigation-bar';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { PaperProvider, Portal } from 'react-native-paper';
import MyModule from '../../modules/my-module/src/MyModule';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const overlayVisible = useOverlayStore((s) => s.visible);
  const overlayChildren = useOverlayStore((s) => s.children);
  const overlayHide = useOverlayStore((s) => s.hide);

  useEffect(() => {
    NavigationBar.setStyle(isDark ? 'light' : 'dark');
  }, [isDark]);

  useEffect(() => {
    const subscription = MyModule.addListener('onNativeLog', (event) => {
      const prefix = `[NATIVE][${event.level}][${event.function}]`;
      const detail = event.details ? ` ${JSON.stringify(event.details)}` : '';
      const output = `${prefix} ${event.message}${detail}`;

      switch (event.level) {
        case 'VERBOSE':
        case 'DEBUG':
          console.debug(output);
          break;
        case 'INFO':
          console.info(output);
          break;
        case 'WARN':
          console.warn(output);
          break;
        case 'ERROR':
          console.error(output, event.error ?? '');
          break;
      }
    });

    return () => subscription.remove();
  }, []);

  // Auto-advance global: saat layar pemutar tidak aktif, tetap lanjut ke lagu berikutnya.
  useEffect(() => {
    const player = getOrCreateAudioPlayer();
    const subscription = player.addListener(
      'playbackStatusUpdate',
      (status: any) => {
        if (!status?.didJustFinish) return;
        const daftar = getPlaylist();
        const indeksBerikut = getPlaylistIndex() + 1;
        if (indeksBerikut >= daftar.length) return;
        const berikut = daftar[indeksBerikut];
        setPlaylistIndex(indeksBerikut);
        const muat = async () => {
          try {
            const info = await new MediaLibrary.Asset(berikut.id).getInfo();
            if (info?.uri) {
              player.pause();
              player.replace(info.uri);
              player.setActiveForLockScreen(true, { title: berikut.filename });
              player.play();
            }
          } catch (e) {
            console.log('RootLayout: gagal memuat lagu berikutnya', e);
          }
        };
        void muat();
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <PaperProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="pemutar-musik" options={{ headerShown: false }} />
          <Stack.Screen
            name="form-pelanggan-aktif"
            options={{ title: 'Form Pelanggan Aktif' }}
          />
        </Stack>

        <Portal>
          {overlayVisible && (
            <View
              pointerEvents="box-none"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedView
                style={{
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                {overlayChildren ?? <ThemedText>tes kan saja</ThemedText>}
              </ThemedView>
            </View>
          )}
        </Portal>
      </PaperProvider>
    </ThemeProvider>
  );
}
