import { NativeModule, requireNativeModule } from 'expo';

import { MyModuleEvents } from './MyModule.types';

declare class MyModule extends NativeModule<MyModuleEvents> {
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

export default requireNativeModule<MyModule>('MyModule');
