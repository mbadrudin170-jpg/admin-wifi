import { useEffect } from "react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";

import MyModule from "../../modules/my-module/src/MyModule";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const subscription = MyModule.addListener("onNativeLog", (event) => {
      const prefix = `[NATIVE][${event.level}][${event.function}]`;
      const detail = event.details ? ` ${JSON.stringify(event.details)}` : "";
      const output = `${prefix} ${event.message}${detail}`;

      switch (event.level) {
        case "VERBOSE":
        case "DEBUG":
          console.debug(output);
          break;
        case "INFO":
          console.info(output);
          break;
        case "WARN":
          console.warn(output);
          break;
        case "ERROR":
          console.error(output, event.error ?? "");
          break;
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="pemutar-musik"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="form-pelanggan-aktif"
          options={{ title: "Form Pelanggan Aktif" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
