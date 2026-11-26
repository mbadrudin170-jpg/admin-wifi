import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      shadowColor={colors.text}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="contoh">
        <NativeTabs.Trigger.Label>Contoh</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="home" />
          }
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="pelanggan-aktif">
        <NativeTabs.Trigger.Label>Pelanggan Aktif</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="people"
            />
          }
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="list-musik">
        <NativeTabs.Trigger.Label>List Musik</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={
            <NativeTabs.Trigger.VectorIcon
              family={MaterialIcons}
              name="music-note"
            />
          }
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
