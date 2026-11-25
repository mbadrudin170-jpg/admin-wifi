import { NativeModule, requireOptionalNativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
  WifiScanEvent,
  ConnectedDevice,
} from './MyModule.types';

declare class MyModuleNative extends NativeModule<MyModuleEvents> {
  scanWifi(): Promise<ScanResponse>;

  getConnectedDevices(): Promise<ConnectedDevice[]>;
}

let nativeModule: MyModuleNative | null = null;
try {
  nativeModule = requireOptionalNativeModule<MyModuleNative>('MyModule');
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
  addListener: (_event: string, _cb: (e: any) => void) => ({
    remove: () => {},
  }),
};

export const isNativeAvailable = nativeModule != null;

export default (nativeModule ?? fallback) as MyModuleNative;
