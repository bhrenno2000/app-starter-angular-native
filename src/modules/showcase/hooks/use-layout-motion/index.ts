import { inject, signal } from '@angular/core';
import { Animated, Easing, Platform } from 'react-native';
import { LayoutAnimation } from '@ng-native/device';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { LayoutRow } from './types';
export function useLayoutMotion() {
  const animation = inject(LayoutAnimation);
  const source = inject(LayoutAnimation.SOURCE);
  const translation = new Animated.Value(0);
  const moved = signal(false);
  const nativeDriverUsed = signal<boolean | null>(null);
  let running: Animated.CompositeAnimation | null = null;
  const lifecycle = useScreenLifecycle(() => {
    running?.stop();
    running = null;
    translation.stopAnimation();
  });
  const expanded = signal(false);
  const rows = signal<readonly LayoutRow[]>([
    { id: 1, title: 'Native row 1' },
    { id: 2, title: 'Native row 2' },
  ]);
  let nextId = 3;
  async function change(update: () => void) {
    lifecycle.assertActive();
    if (!source) throw new Error('Native layout animation is unavailable in this runtime.');
    await animation.animate(update, {
      duration: 600,
      easing: 'easeInEaseOut',
      appear: 'opacity',
      leave: 'opacity',
    });
    return {
      expanded: expanded(),
      rowCount: rows().length,
      animationRequested: true,
      animationsDisabledByPlatform: Boolean(Reflect.get(Platform, 'isDisableAnimations')),
      testingEnvironment: Boolean(Platform.isTesting),
      fabricAnimationAvailable:
        typeof Reflect.get(globalThis, 'nativeFabricUIManager')?.configureNextLayoutAnimation ===
        'function',
      durationMs: 600,
      note: 'The platform controls animation execution and reduced-motion settings.',
    };
  }
  return {
    layout: {
      nativeDriverUsed: nativeDriverUsed.asReadonly(),
      expanded: expanded.asReadonly(),
      rows: rows.asReadonly(),
      animatedStyle: {
        transform: [{ translateX: translation }],
        opacity: translation.interpolate({ inputRange: [0, 140], outputRange: [1, 0.5] }),
      },
    },
    ...useNativeTask([
      {
        id: 'native-driver',
        label: 'Move with native driver',
        run: async () => {
          lifecycle.assertActive();
          const active = lifecycle.checkpoint();
          const target = moved() ? 0 : 140;
          const motion = Animated.timing(translation, {
            toValue: target,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          });
          running = motion;
          const finished = await new Promise<boolean>((resolve) =>
            motion.start((result) => resolve(result.finished)),
          );
          if (running === motion) running = null;
          if (!finished || !active())
            return 'Native animation cancelled when the screen became inactive.';
          nativeDriverUsed.set(Reflect.get(translation, '__isNative') === true);
          moved.set(target !== 0);
          return {
            driver: nativeDriverUsed()
              ? 'React Native Animated native driver'
              : 'JavaScript fallback',
            finished,
            translateX: target,
            durationMs: 900,
          };
        },
      },
      {
        id: 'expand',
        label: 'Toggle animated panel',
        run: () => change(() => expanded.update((value) => !value)),
      },
      {
        id: 'add',
        label: 'Insert animated row',
        run: () => {
          if (rows().length >= 5)
            throw new Error('The preview holds up to five rows. Remove a row first.');
          return change(() => {
            const id = nextId++;
            rows.update((value) => [...value, { id, title: `Native row ${id}` }]);
          });
        },
      },
      {
        id: 'remove',
        label: 'Remove animated row',
        run: () => {
          if (!rows().length) throw new Error('No preview rows remain. Insert a row first.');
          return change(() => rows.update((value) => value.slice(0, -1)));
        },
      },
    ]),
  };
}
