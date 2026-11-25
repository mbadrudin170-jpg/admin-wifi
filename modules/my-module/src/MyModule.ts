import { NativeModule, requireOptionalNativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
  WifiScanEvent,
  ConnectedDevice,
} from './MyModule.types';

let nativeModule: any = null;
try {
  nativeModule = requireOptionalNativeModule('MyModule');
} catch {
  nativeModule = null;
}

const fallback = {
  async scanWifi(): Promise<ScanResponse> {
    return {
      started: false,
      message: 'Modul native tidak tersedia (gunakan development build).',
    };
  },
  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    throw new Error('Modul native tidak tersedia (gunakan development build).');
  },
  addListener: (_event: string, _cb: (e: WifiScanEvent) => void) => ({
    remove: () => {},
  }),
};

export const isNativeAvailable = nativeModule != null;

export default (nativeModule ?? fallback) as {
  scanWifi: () => Promise<ScanResponse>;
  getConnectedDevices: () => Promise<ConnectedDevice[]>;
  addListener: (event: string, cb: (e: WifiScanEvent) => void) => { remove: () => void };
};
