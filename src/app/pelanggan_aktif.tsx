import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function PelangganAktifScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#208AEF" }}>
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
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Text>satu</Text>
      </View>
      <Pressable
        onPress={() => router.push("/form_pelanggan_aktif")}
        style={{ padding: 12, backgroundColor: "#208AEF", borderRadius: 8 }}
      >
        <Text style={{ color: "#fff" }}>Tombol</Text>
      </Pressable>
    </View>
  );
}
