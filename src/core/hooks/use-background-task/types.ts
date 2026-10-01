export interface BackgroundRun {
  id: number;
  executedAt: string;
  execution: 'native-worker' | 'foreground-preview';
}
