import type { Signal } from '@angular/core';
export interface NativeAction {
  id: string;
  label: string;
  run: () => unknown | Promise<unknown>;
}
export interface NativeTask {
  actions: readonly NativeAction[];
  busy: Signal<string | null>;
  error: Signal<string | null>;
  output: Signal<string>;
  perform: (id: string) => Promise<void>;
}
