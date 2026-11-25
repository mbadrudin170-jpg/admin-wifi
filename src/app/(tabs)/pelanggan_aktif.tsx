import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { FlatList } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { usePelangganAktifStore } from "@/store/pelangganAktifStore";
import { PelangganAktif } from "@/db/pelangganAktif";

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

      <View style={{ flex: 1, backgroundColor: "#fff" }}></View>
      <ListPelangganAktif />
      <Pressable
        onPress={() => {
          router.push("/form_pelanggan_aktif");
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
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#eee"
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
