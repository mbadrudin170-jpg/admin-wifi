import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { FlatList } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePelangganAktifStore } from "@/store/pelanggan-aktif-store";

export default function PelangganAktifScreen() {
  const insets = useSafeAreaInsets();
  const items = usePelangganAktifStore((s) => s.items);
  const load = usePelangganAktifStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} style={{ flex: 1 }}>
      <View
        style={{
          paddingTop: insets.top,
          height: 56 + insets.top,
          backgroundColor: "#208AEF",
          justifyContent: "center",
          paddingHorizontal: 16
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
          Pelanggan Aktif
        </Text>
      </View>

      <ListPelangganAktif />

      <Pressable
        onPress={() => {
          console.log("ok");
          router.push("/form-pelanggan-aktif");
        }}
        style={{
          padding: 12,
          backgroundColor: "#208AEF",
          borderRadius: 8,
          margin: 12
        }}
      >
        <Text style={{ color: "#fff" }}>Tombol</Text>
      </Pressable>
    </SafeAreaView>
  );

  function ListPelangganAktif() {
    return (
      <FlatList
        data={items}
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 8, padding: 8 }}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              marginVertical: 2,
              borderRadius: 12,
              backgroundColor: "#fff",
              elevation: 2, // Android shadow
              shadowColor: "#000", // iOS shadow
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2
            }}
          >
            <Text>{item.nama}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 12 }}>Belum ada data</Text>}
      />
    );
  }
}
