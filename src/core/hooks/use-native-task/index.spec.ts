import { Component, InjectionToken, inject } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useNativeTask } from './index';
import type { NativeAction } from './types';
const ACTIONS = new InjectionToken<readonly NativeAction[]>('test-native-actions');
@Component({ selector: 'test-task', template: '' })
class Host {
  readonly task = useNativeTask(inject(ACTIONS));
}
afterEach(cleanup);
test('serializes results and exposes native failures for recovery', async () => {
  const failed = vi.fn().mockRejectedValue(new Error('Camera permission was denied.'));
  const { componentRef } = await render(Host, {
    providers: [
      {
        provide: ACTIONS,
        useValue: [
          { id: 'ok', label: 'Success', run: () => ({ saved: true }) },
          { id: 'fail', label: 'Failure', run: failed },
        ],
      },
    ],
  });
  await componentRef.instance.task.perform('fail');
  expect(componentRef.instance.task.error()).toContain('Camera permission');
  expect(componentRef.instance.task.busy()).toBeNull();
  await componentRef.instance.task.perform('ok');
  expect(componentRef.instance.task.error()).toBeNull();
  expect(JSON.parse(componentRef.instance.task.output())).toEqual({ saved: true });
});
test('prevents duplicate native actions while a request is pending', async () => {
  let finish: (value: string) => void = () => {};
  const action = vi.fn(
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  const { componentRef } = await render(Host, {
    providers: [{ provide: ACTIONS, useValue: [{ id: 'open', label: 'Open', run: action }] }],
  });
  const first = componentRef.instance.task.perform('open');
  await componentRef.instance.task.perform('open');
  expect(action).toHaveBeenCalledTimes(1);
  expect(componentRef.instance.task.busy()).toBe('open');
  finish('Done');
  await first;
  expect(componentRef.instance.task.output()).toBe('Done');
});
test('does not publish asynchronous results after its owner is destroyed', async () => {
  let finish: (value: string) => void = () => {};
  const { componentRef } = await render(Host, {
    providers: [
      {
        provide: ACTIONS,
        useValue: [
          {
            id: 'open',
            label: 'Open',
            run: () =>
              new Promise<string>((resolve) => {
                finish = resolve;
              }),
          },
        ],
      },
    ],
  });
  const task = componentRef.instance.task;
  const pending = task.perform('open');
  componentRef.destroy();
  finish('Late result');
  await pending;
  expect(task.output()).toBe('Run a demonstration to see its result.');
});
