import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    </View>
  );
}
