import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export default function ContohScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>
          Contoh Screen
        </ThemedText>
        <ThemedText type="default" style={styles.subtitle}>
          Ini adalah screen contoh sederhana
        </ThemedText>

        <View style={styles.buttonRow}>
          <ThemedView type="backgroundElement" style={styles.button}>
            <ThemedText type="default" style={styles.buttonText}>
              Tombol 1
            </ThemedText>
          </ThemedView>
          <ThemedView type="backgroundElement" style={styles.button}>
            <ThemedText type="default" style={styles.buttonText}>
              Tombol 2
            </ThemedText>
          </ThemedView>
        </View>

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
    alignItems: "center"
  },
  title: {
    textAlign: "center"
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two
  },
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    flex: 1,
    alignItems: "center"
  },
  buttonText: {
    fontWeight: "600"
  },
  footer: {
    marginTop: Spacing.three,
    textAlign: "center",
    opacity: 0.6
  }
});
