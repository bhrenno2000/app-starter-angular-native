import type * as ScreenCapture from 'expo-screen-capture';
export type ScreenshotSubscription = ReturnType<typeof ScreenCapture.addScreenshotListener>;
export interface ScreenPolicyState {
  awake: boolean;
  blocked: boolean;
  switcherProtected: boolean;
  observing: boolean;
  screenshots: number;
  cleanupError: string | null;
}
