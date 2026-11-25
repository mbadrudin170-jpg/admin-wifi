export type ConnectedDevice = {
  ip: string;
  mac: string;
};

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

export type WifiScanEvent = {
  success: boolean;
  message: string;
  networks: WifiNetwork[];
};

export type MyModuleEvents = {
  onScanResults: (event: WifiScanEvent) => void;
};
