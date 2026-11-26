import { MarqueeText } from '@/components/marquee-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useOverlayStore } from '@/store/overlay-store';
import {
  getOrCreateAudioPlayer,
  getPlaylist,
  getPlaylistIndex,
  setPlaylistIndex,
  usePlayerStore,
} from '@/store/player-store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform } from 'expo';
import { useAudioPlayerStatus } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import { NavigationBar } from 'expo-navigation-bar';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, useColorScheme, View } from 'react-native';
import { PaperProvider, Portal } from 'react-native-paper';
import MyModule from '../../modules/my-module/src/MyModule';
import { mainkanSelanjutnya } from './pemutar-musik';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const overlayVisible = useOverlayStore((s) => s.visible);
  const scheme = useColorScheme();
  const iconColor = scheme === 'dark' ? Colors.dark.text : Colors.light.text;
  const player = getOrCreateAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const playlist = usePlayerStore((s) => s.playlist);
  const index = usePlayerStore((s) => s.index);

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
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: 120,
              }}
            >
              <ThemedView
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  width: '100%',
                  borderRadius: 12,
                  overflow: 'hidden',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  ...Platform.select({
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                }}
              >
                <MarqueeText
                  containerStyle={{
                    flex: 1,
                    minWidth: 0,
                  }}
                  style={{ color: iconColor }}
                  text={playlist[index]?.filename ?? 'Pemutar Musik'}
                  speed={40}
                  pause={800}
                />

                <ThemedView style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable>
                    <MaterialIcons
                      name="skip-previous"
                      size={24}
                      color={iconColor}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      console.log(
                        'PemutarMusik: tombol',
                        status.playing ? 'Jeda' : 'Putar',
                      );
                      if (status.playing) {
                        player.pause();
                      } else {
                        player.play();
                      }
                    }}
                  >
                    <MaterialIcons
                      name={status.playing ? 'pause' : 'play-arrow'}
                      accessibilityLabel={status.playing ? 'Jeda' : 'Putar'}
                      size={24}
                      color={iconColor}
                    />
                  </Pressable>
                  <Pressable onPress={mainkanSelanjutnya}>
                    <MaterialIcons
                      name="skip-next"
                      size={24}
                      color={iconColor}
                    />
                  </Pressable>
                </ThemedView>
              </ThemedView>
            </View>
          )}
        </Portal>
      </PaperProvider>
    </ThemeProvider>
  );
}
