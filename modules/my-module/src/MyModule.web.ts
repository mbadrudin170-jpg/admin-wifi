import { registerWebModule, NativeModule } from 'expo';

import type {
  MyModuleEvents,
  ScanResponse,
  ConnectedDevice,
} from './MyModule.types';

class MyModule extends NativeModule<MyModuleEvents> {
  async scanWifi(): Promise<ScanResponse> {
    return {
      started: false,
      message: 'Pemindaian Wi-Fi hanya tersedia di Android.',
    };
  }

  async getConnectedDevices(): Promise<ConnectedDevice[]> {
    return [];
  }
}

export default registerWebModule(MyModule, 'MyModule');
