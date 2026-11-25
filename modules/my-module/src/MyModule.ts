import { NativeModule, requireNativeModule } from 'expo';

export type WifiNetwork = {
  ssid: string;
  bssid: string;
  rssi: number;
  frequency: number;
  channel: number;
  capabilities: string;
};

export type ScanResponse = {
  started: boolean;
  message: string;
};

declare class MyModule extends NativeModule {
  scanWifi(): Promise<ScanResponse>;
  getScanResults(): Promise<WifiNetwork[]>;
}

export default requireNativeModule<MyModule>('MyModule');
