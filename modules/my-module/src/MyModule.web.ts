import { registerWebModule, NativeModule } from 'expo';

import { MyModuleEvents } from './MyModule.types';

class MyModule extends NativeModule<MyModuleEvents> {
  hello() {
    return 'Hello world! 👋';
  }

  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
}

export default registerWebModule(MyModule, 'MyModule');
