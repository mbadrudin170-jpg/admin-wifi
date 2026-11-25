import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function PelangganAktifScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedText type="title">Pelanggan Aktif</ThemedText>
      <ThemedText type="default">Screen sederhana</ThemedText>
    </ThemedView>
  );
}
