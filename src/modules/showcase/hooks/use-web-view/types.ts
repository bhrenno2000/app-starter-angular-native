import type { TurboModule } from 'react-native';
export interface NativeWebViewModule extends TurboModule {
  shouldStartLoadWithLockIdentifier(shouldStart: boolean, lockIdentifier: number): void;
}
