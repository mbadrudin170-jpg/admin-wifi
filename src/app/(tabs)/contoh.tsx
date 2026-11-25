import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import * as Location from "expo-location";

import MyModule from "../../../modules/my-module/src/MyModule";
import type { WifiNetwork } from "../../../modules/my-module/src/MyModule.types";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

enum Tampilan {
  Wifi = "Wifi",
  Perangkat = "Perangkat"
}

export default function ContohScreen() {
  const [networks, setNetworks] = useState<WifiNetwork[]>([]);
  const [status, setStatus] = useState<string>("Belum dipindai");
  const [scanning, setScanning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [tampilan, setTampilan] = useState<Tampilan>(Tampilan.Wifi);

  useEffect(() => {
    const subscription = MyModule.addListener("onScanResults", (event: any) => {
      setStatus(event.message);
      if (event.success) {
        setNetworks(event.networks);
      }
    });
    return () => {
      subscription.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const runScan = async () => {
    try {
      const result = await MyModule.scanWifi();
      setStatus(result.message);
      if (!result.started) {
        // native tidak memulai scan; tetap coba lagi di interval berikutnya
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal memindai");
    }
  };

  const startScan = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setStatus("Izin lokasi ditolak");
      return;
    }
    setScanning(true);
    setStatus("Memindai...");
    await runScan();
    intervalRef.current = setInterval(runScan, 30 * 60 * 1000);
  };

  const stopScan = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setScanning(false);
    setStatus("Pemindaian dihentikan");
  };

  useEffect(() => {
    void startScan();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Daftar Wi-Fi
        </ThemedText>

        <ThemedView>
          <Pressable
            onPress={() => setTampilan(Tampilan.Perangkat)}
          ></Pressable>
        </ThemedView>

        <ThemedText type="default" style={styles.subtitle}>
          {status}
        </ThemedText>

        <FlatList
          data={networks}
          keyExtractor={(item, index) => `${item.bssid}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText type="small" style={styles.empty}>
              Belum ada jaringan Wi-Fi
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View style={styles.networkRow}>
              <ThemedText type="default" style={styles.ssid}>
                {item.ssid || "(Tersembunyi)"}
              </ThemedText>
              <ThemedText type="small" style={styles.meta}>
                RSSI {item.rssi} dBm · Ch {item.channel} · {item.frequency} MHz
              </ThemedText>
              <ThemedText type="small" style={styles.meta}>
                {item.bssid}
              </ThemedText>
            </View>
          )}
        />

        <ThemedText type="small" style={styles.footer}>
          Dibuat dengan Expo + TypeScript + React Native
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.three,
    alignItems: "center",
    flex: 1
  },
  title: {
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8
  },
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#208AEF"
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    fontWeight: "600",
    color: "#fff"
  },
  list: {
    alignSelf: "stretch",
    flex: 1
  },
  listContent: {
    gap: Spacing.two
  },
  networkRow: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: "rgba(0,0,0,0.05)",
    gap: Spacing.one
  },
  ssid: {
    fontWeight: "600"
  },
  meta: {
    opacity: 0.7
  },
  empty: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: Spacing.three
  },
  footer: {
    marginTop: Spacing.three,
    textAlign: "center",
    opacity: 0.6
  }
});
