import { computed, effect, signal } from '@angular/core';
import { sharedValue, workletStyle } from '@ng-native/components/reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { cancelAnimation, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { InteractionKind, InteractionSnapshot } from './types';

export function useInteractions() {
  const x = sharedValue(0);
  const y = sharedValue(0);
  const scale = sharedValue(1);
  const startX = sharedValue(0);
  const startY = sharedValue(0);
  const startScale = sharedValue(1);
  const enabled = sharedValue(true);
  const epoch = sharedValue(0);
  const panEpoch = sharedValue(0);
  const pinchEpoch = sharedValue(0);
  const pressEpoch = sharedValue(0);
  const snapshot = signal<InteractionSnapshot>({
    lastGesture: null,
    translationX: 0,
    translationY: 0,
    scale: 1,
    taps: 0,
    longPresses: 0,
  });
  const lifecycle = useScreenLifecycle(() => {
    enabled.value = false;
    epoch.value++;
    cancelAnimation(x);
    cancelAnimation(y);
    cancelAnimation(scale);
  });
  effect(() => {
    enabled.value = lifecycle.isActive();
  });
  function report(
    kind: InteractionKind,
    currentEpoch: number,
    dx: number,
    dy: number,
    zoom: number,
  ) {
    if (!enabled.value || currentEpoch !== epoch.value) return;
    try {
      lifecycle.assertActive();
    } catch {
      return;
    }
    snapshot.update((current) => ({
      lastGesture: kind,
      translationX: Math.round(dx),
      translationY: Math.round(dy),
      scale: Math.round(zoom * 100) / 100,
      taps: current.taps + Number(kind === 'tap'),
      longPresses: current.longPresses + Number(kind === 'long-press'),
    }));
  }
  const pan = Gesture.Pan()
    .maxPointers(1)
    .onBegin(() => {
      'worklet';
      cancelAnimation(x);
      cancelAnimation(y);
      startX.value = x.value;
      startY.value = y.value;
      panEpoch.value = epoch.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (!enabled.value || panEpoch.value !== epoch.value) return;
      x.value = Math.max(-100, Math.min(100, startX.value + event.translationX));
      y.value = Math.max(-45, Math.min(45, startY.value + event.translationY));
    })
    .onEnd(() => {
      'worklet';
      scheduleOnRN(report, 'pan', panEpoch.value, x.value, y.value, scale.value);
    });
  const pinch = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      cancelAnimation(scale);
      startScale.value = scale.value;
      pinchEpoch.value = epoch.value;
    })
    .onUpdate((event) => {
      'worklet';
      if (!enabled.value || pinchEpoch.value !== epoch.value) return;
      scale.value = Math.max(0.75, Math.min(1.6, startScale.value * event.scale));
    })
    .onEnd(() => {
      'worklet';
      scheduleOnRN(report, 'pinch', pinchEpoch.value, x.value, y.value, scale.value);
    });
  const tap = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      pressEpoch.value = epoch.value;
    })
    .onEnd((_event, success) => {
      'worklet';
      if (success) scheduleOnRN(report, 'tap', pressEpoch.value, x.value, y.value, scale.value);
    });
  const longPress = Gesture.LongPress()
    .minDuration(650)
    .onBegin(() => {
      'worklet';
      pressEpoch.value = epoch.value;
    })
    .onEnd((_event, success) => {
      'worklet';
      if (success)
        scheduleOnRN(report, 'long-press', pressEpoch.value, x.value, y.value, scale.value);
    });
  return {
    interaction: {
      transformGesture: Gesture.Simultaneous(pan, pinch),
      pressGesture: Gesture.Exclusive(longPress, tap),
      style: workletStyle([x, y, scale], (dx, dy, zoom) => {
        'worklet';
        return {
          transform: [{ translateX: dx.value }, { translateY: dy.value }, { scale: zoom.value }],
        };
      }),
      summary: computed(() => JSON.stringify(snapshot(), null, 2)),
    },
    ...useNativeTask([
      {
        id: 'reset',
        label: 'Reset interaction preview',
        run: () => {
          lifecycle.assertActive();
          epoch.value++;
          enabled.value = true;
          cancelAnimation(x);
          cancelAnimation(y);
          cancelAnimation(scale);
          x.value = 0;
          y.value = 0;
          scale.value = 1;
          snapshot.set({
            lastGesture: null,
            translationX: 0,
            translationY: 0,
            scale: 1,
            taps: 0,
            longPresses: 0,
          });
          return 'Interaction preview reset. Gestures are active.';
        },
      },
      {
        id: 'spring',
        label: 'Run a Reanimated spring',
        run: () => {
          lifecycle.assertActive();
          enabled.value = true;
          x.value = withSpring(80);
          scale.value = withSpring(1.2);
          return 'UI-thread spring requested. Drag or pinch to change the preview.';
        },
      },
    ]),
  };
}
