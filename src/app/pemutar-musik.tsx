import { useEffect } from 'react';
import { Button, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PemutarMusik() {
  const { id, judul } = useLocalSearchParams<{ id?: string; judul?: string }>();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    let aktif = true;

    const muatSumber = async () => {
      if (!id) return;
      const info = await new MediaLibrary.Asset(id).getInfo();
      if (aktif && info?.uri) {
        player.replace(info.uri);
      }
    };

    void muatSumber();

    return () => {
      aktif = false;
    };
  }, [id, player]);

  return (
    <SafeAreaView>
      <ThemedView>
        <ThemedText>Pemutar Musik {judul ?? ''}</ThemedText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            title={status.playing ? 'Jeda' : 'Putar'}
            onPress={() => (status.playing ? player.pause() : player.play())}
          />
          <Button
            title="Ulang"
            onPress={() => {
              void player.seekTo(0);
              player.play();
            }}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
