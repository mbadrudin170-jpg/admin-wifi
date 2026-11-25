export type ConnectedDevice = {
  ip: string;
  mac: string;
  sumber?: string;
};

export type NativeLogLevel =
  | 'VERBOSE'
  | 'DEBUG'
  | 'INFO'
  | 'WARN'
  | 'ERROR';

export type NativeLogEvent = {
  level: NativeLogLevel;
  tag: string;
  function: string;
  message: string;
  timestamp: number;
  details?: Record<string, string | number | boolean | null>;
  error?: string;
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
  onNativeLog: (event: NativeLogEvent) => void;
};
