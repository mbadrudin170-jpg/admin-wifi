import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

import { addPelangganAktif } from "@/db/pelangganAktif";

export default function FormPelangganAktifScreen() {
  const [nama, setNama] = useState("");

  const handleSave = () => {
    if (!nama.trim()) return;
    addPelangganAktif(nama.trim());
    setNama("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={nama}
        onChangeText={setNama}
        placeholder="Nama pelanggan aktif"
        style={styles.input}
      />
      <Button title="Simpan" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
});
