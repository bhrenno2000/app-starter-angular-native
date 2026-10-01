export type InteractionKind = 'pan' | 'pinch' | 'tap' | 'long-press';
export interface InteractionSnapshot {
  lastGesture: InteractionKind | null;
  translationX: number;
  translationY: number;
  scale: number;
  taps: number;
  longPresses: number;
}
