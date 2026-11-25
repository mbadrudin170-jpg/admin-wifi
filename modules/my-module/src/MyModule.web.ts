import { registerWebModule, NativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
} from './MyModule.types';

class MyModule extends NativeModule<MyModuleEvents> {
  async scanWifi(): Promise<ScanResponse> {
    return {
      started: false,
      message: 'Pemindaian Wi-Fi hanya tersedia di Android.',
    };
  }
}

export default registerWebModule(MyModule, 'MyModule');
