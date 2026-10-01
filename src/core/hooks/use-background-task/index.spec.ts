import { Component } from '@angular/core';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { defineBackgroundTask, useBackgroundTask } from './index';
const native = vi.hoisted(() => ({
  platform: { OS: 'ios' },
  device: { isDevice: true },
  define: vi.fn(),
  defined: vi.fn(),
  available: vi.fn(),
  registered: vi.fn(),
  status: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
  trigger: vi.fn(),
  open: vi.fn(),
  db: {
    execAsync: vi.fn(),
    runAsync: vi.fn(),
    withTransactionAsync: vi.fn(),
    getAllAsync: vi.fn(),
    closeAsync: vi.fn(),
  },
}));
vi.mock('react-native', () => ({ Platform: native.platform }));
vi.mock('expo-device', () => native.device);
vi.mock('expo-task-manager', () => ({
  defineTask: native.define,
  isTaskDefined: native.defined,
  isAvailableAsync: native.available,
  isTaskRegisteredAsync: native.registered,
}));
vi.mock('expo-background-task', () => ({
  getStatusAsync: native.status,
  registerTaskAsync: native.register,
  unregisterTaskAsync: native.unregister,
  triggerTaskWorkerForTestingAsync: native.trigger,
  BackgroundTaskStatus: { Restricted: 1, Available: 2 },
  BackgroundTaskResult: { Success: 1, Failed: 2 },
}));
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: native.open }));
@Component({ template: '' })
class Host {
  readonly demo = useBackgroundTask();
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('__DEV__', false);
  native.platform.OS = 'ios';
  native.device.isDevice = true;
  native.defined.mockReturnValue(true);
  native.available.mockResolvedValue(true);
  native.status.mockResolvedValue(2);
  native.registered.mockResolvedValue(false);
  native.open.mockResolvedValue(native.db);
  native.db.execAsync.mockResolvedValue(undefined);
  native.db.runAsync.mockResolvedValue({ changes: 1 });
  native.db.closeAsync.mockResolvedValue(undefined);
  native.db.getAllAsync.mockResolvedValue([]);
  native.db.withTransactionAsync.mockImplementation(async (operation: () => Promise<void>) =>
    operation(),
  );
});
async function setup() {
  const result = await render(Host);
  return result.componentRef.instance.demo;
}
test('definition is idempotent and native worker returns failure on persistence errors', async () => {
  defineBackgroundTask();
  expect(native.define).not.toHaveBeenCalled();
  native.defined.mockReturnValue(false);
  defineBackgroundTask();
  const execute = native.define.mock.calls[0][1];
  expect(await execute({ error: null })).toBe(1);
  expect(native.db.runAsync.mock.calls[0][2]).toBe('native-worker');
  expect(await execute({ error: { message: 'Native execution error' } })).toBe(2);
  native.db.runAsync.mockRejectedValue(new Error('Disk unavailable'));
  expect(await execute({ error: null })).toBe(2);
  expect(native.db.closeAsync).toHaveBeenCalledTimes(2);
});
test('simulator inspection does not prove execution and registration is refused on iOS', async () => {
  native.device.isDevice = false;
  const demo = await setup();
  await demo.perform('inspect');
  expect(JSON.parse(demo.output()).operatingSystemExecutionVerified).toBe(false);
  await demo.perform('register');
  expect(demo.error()).toContain('physical');
  expect(native.register).not.toHaveBeenCalled();
});
test('restricted scheduler does not register a task', async () => {
  native.status.mockResolvedValue(1);
  const demo = await setup();
  await demo.perform('register');
  expect(demo.error()).toContain('restricted');
  expect(native.register).not.toHaveBeenCalled();
});
test('registration persists after the consumer is destroyed and only its task can be unregistered', async () => {
  const demo = await setup();
  await demo.perform('register');
  expect(native.register).toHaveBeenCalledWith('angular-native-showcase-background-v1', {
    minimumInterval: 15,
  });
  cleanup();
  expect(native.unregister).not.toHaveBeenCalled();
  native.registered.mockResolvedValue(true);
  const next = await setup();
  await next.perform('unregister');
  expect(native.unregister).toHaveBeenCalledWith('angular-native-showcase-background-v1');
});
test('foreground preview is labelled separately and uses an owned SQLite connection', async () => {
  const demo = await setup();
  await demo.perform('preview');
  expect(native.open).toHaveBeenCalledWith('showcase-background.sqlite', {
    useNewConnection: true,
  });
  expect(native.db.runAsync.mock.calls[0][2]).toBe('foreground-preview');
  expect(JSON.parse(demo.output())).toMatchObject({
    execution: 'foreground-preview',
    operatingSystemExecutionVerified: false,
  });
  expect(native.db.closeAsync).toHaveBeenCalledTimes(2);
});
test('Release refuses the development trigger and development requires registration', async () => {
  const demo = await setup();
  await demo.perform('test-worker');
  expect(demo.error()).toContain('development build');
  expect(native.trigger).not.toHaveBeenCalled();
  vi.stubGlobal('__DEV__', true);
  await demo.perform('test-worker');
  expect(demo.error()).toContain('Register this showcase');
  native.registered.mockResolvedValue(true);
  native.trigger.mockResolvedValue(true);
  await demo.perform('test-worker');
  expect(native.trigger).toHaveBeenCalledOnce();
});
test('schema setup failure closes the connection and surfaces the journal error', async () => {
  native.db.execAsync.mockRejectedValue(new Error('Journal setup failed'));
  const demo = await setup();
  await demo.perform('preview');
  expect(demo.error()).toContain('Journal setup failed');
  expect(native.db.closeAsync).toHaveBeenCalledOnce();
  expect(native.db.runAsync).not.toHaveBeenCalled();
});
