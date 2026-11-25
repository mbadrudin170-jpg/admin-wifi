import { NativeModule, requireOptionalNativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
  WifiScanEvent,
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
  addListener: (_event: string, _cb: (e: WifiScanEvent) => void) => ({
    remove: () => {},
  }),
};

export default (nativeModule ?? fallback) as {
  scanWifi: () => Promise<ScanResponse>;
  addListener: (event: string, cb: (e: WifiScanEvent) => void) => { remove: () => void };
};
