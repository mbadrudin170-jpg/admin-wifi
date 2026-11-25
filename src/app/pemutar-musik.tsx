import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PemutarMusik() {
  const { id, judul } = useLocalSearchParams<{ id?: string; judul?: string }>();

  return (
    <SafeAreaView>
      <ThemedView>
        <ThemedText>Pemutar Musik {judul ?? ''}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
