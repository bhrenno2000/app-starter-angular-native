import { DestroyRef, inject, signal } from '@angular/core';
import type { NativeAction, NativeTask } from './types';
export function useNativeTask(actions: readonly NativeAction[]): NativeTask {
  const busy = signal<string | null>(null);
  const error = signal<string | null>(null);
  const output = signal('Run a demonstration to see its result.');
  let disposed = false;
  inject(DestroyRef).onDestroy(() => {
    disposed = true;
  });
  return {
    actions,
    busy: busy.asReadonly(),
    error: error.asReadonly(),
    output: output.asReadonly(),
    async perform(id) {
      if (busy() || disposed) return;
      const action = actions.find((entry) => entry.id === id);
      if (!action) return;
      busy.set(id);
      error.set(null);
      try {
        const result = await action.run();
        if (!disposed)
          output.set(
            typeof result === 'string' ? result : JSON.stringify(result ?? 'Completed', null, 2),
          );
      } catch (cause) {
        if (!disposed)
          error.set(cause instanceof Error ? cause.message : 'This action could not be completed.');
      } finally {
        if (!disposed) busy.set(null);
      }
    },
  };
}
