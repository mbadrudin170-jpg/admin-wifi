import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { usePelangganAktifStore } from '@/store/pelanggan-aktif-store';

export default function FormPelangganAktifScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const [nama, setNama] = useState('');
  const add = usePelangganAktifStore((s) => s.add);

  const handleSave = () => {
    if (!nama.trim()) return;
    add({ nama: nama.trim() });
    setNama('');
    router.back();
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
});
