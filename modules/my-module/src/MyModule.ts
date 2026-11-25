import { NativeModule, requireNativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
} from './MyModule.types';

declare class MyModule extends NativeModule<MyModuleEvents> {
  scanWifi(): Promise<ScanResponse>;
}

export default requireNativeModule<MyModule>('MyModule');
