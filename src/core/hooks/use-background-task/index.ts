import { signal } from '@angular/core';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as SQLite from 'expo-sqlite';
import { useNativeTask } from '../use-native-task';
import type { BackgroundRun } from './types';
const taskName = 'angular-native-showcase-background-v1';
const development = () => typeof __DEV__ !== 'undefined' && __DEV__;
async function database() {
  const db = await SQLite.openDatabaseAsync('showcase-background.sqlite', {
    useNewConnection: true,
  });
  try {
    await db.execAsync(
      'PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY AUTOINCREMENT, executedAt TEXT NOT NULL, execution TEXT NOT NULL)',
    );
    return db;
  } catch (error) {
    await db.closeAsync();
    throw error;
  }
}
export async function recordBackgroundExecution(execution: BackgroundRun['execution']) {
  const db = await database();
  try {
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT INTO runs (executedAt, execution) VALUES (?, ?)',
        new Date().toISOString(),
        execution,
      );
      await db.runAsync(
        'DELETE FROM runs WHERE id NOT IN (SELECT id FROM runs ORDER BY id DESC LIMIT 25)',
      );
    });
  } finally {
    await db.closeAsync();
  }
}
export function defineBackgroundTask() {
  if (TaskManager.isTaskDefined(taskName)) return;
  TaskManager.defineTask(taskName, async ({ error }) => {
    if (error) return BackgroundTask.BackgroundTaskResult.Failed;
    try {
      await recordBackgroundExecution('native-worker');
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}
export function useBackgroundTask() {
  const reading = signal(
    'Registration persists beyond this screen. The operating system chooses execution times; a 15-minute minimum is not an exact schedule.',
  );
  async function history() {
    const db = await database();
    try {
      return await db.getAllAsync<BackgroundRun>(
        'SELECT id, executedAt, execution FROM runs ORDER BY id DESC LIMIT 25',
      );
    } finally {
      await db.closeAsync();
    }
  }
  async function available() {
    if (Platform.OS === 'ios' && !isDevice)
      throw new Error(
        'iOS background scheduling requires a physical device. Simulator journal previews do not prove background execution.',
      );
    if (!(await TaskManager.isAvailableAsync()))
      throw new Error(
        'The native task manager is unavailable. Rebuild and install the native app.',
      );
    if ((await BackgroundTask.getStatusAsync()) !== BackgroundTask.BackgroundTaskStatus.Available)
      throw new Error(
        'Background scheduling is restricted. Check background refresh and power settings.',
      );
    if (!TaskManager.isTaskDefined(taskName))
      throw new Error('The background task was not defined at bundle startup.');
  }
  return {
    reading: reading.asReadonly(),
    ...useNativeTask([
      {
        id: 'inspect',
        label: 'Inspect background scheduler',
        run: async () => ({
          taskDefined: TaskManager.isTaskDefined(taskName),
          taskManagerAvailable: await TaskManager.isAvailableAsync(),
          schedulerStatus: await BackgroundTask.getStatusAsync(),
          registered: await TaskManager.isTaskRegisteredAsync(taskName),
          physicalDevice: isDevice,
          developmentBuild: development(),
          operatingSystemExecutionVerified: false,
          note: 'Inspect execution history for actual worker callbacks. iOS scheduling requires hardware.',
        }),
      },
      {
        id: 'register',
        label: 'Register background task (15-minute minimum)',
        run: async () => {
          await available();
          await BackgroundTask.registerTaskAsync(taskName, { minimumInterval: 15 });
          reading.set(
            'Background task registered. It remains registered after leaving this screen; execution timing is controlled by the operating system.',
          );
          return {
            registered: await TaskManager.isTaskRegisteredAsync(taskName),
            minimumIntervalMinutes: 15,
            exactSchedule: false,
          };
        },
      },
      {
        id: 'unregister',
        label: 'Unregister this background task',
        run: async () => {
          if (await TaskManager.isTaskRegisteredAsync(taskName))
            await BackgroundTask.unregisterTaskAsync(taskName);
          reading.set('This showcase task is unregistered. Other tasks are unchanged.');
          return { registered: await TaskManager.isTaskRegisteredAsync(taskName) };
        },
      },
      { id: 'history', label: 'Read background execution history', run: history },
      {
        id: 'preview',
        label: 'Run journal logic in foreground',
        run: async () => {
          await recordBackgroundExecution('foreground-preview');
          reading.set(
            'Foreground preview recorded. This verifies journal logic, not background scheduling.',
          );
          return {
            execution: 'foreground-preview',
            operatingSystemExecutionVerified: false,
            recentRuns: await history(),
          };
        },
      },
      {
        id: 'test-worker',
        label: 'Trigger native worker (development build)',
        run: async () => {
          if (!development())
            throw new Error(
              'Native worker testing is available only in a development build. Release builds cannot invoke this test API.',
            );
          await available();
          if (!(await TaskManager.isTaskRegisteredAsync(taskName)))
            throw new Error('Register this showcase task before triggering the native worker.');
          const triggered = await BackgroundTask.triggerTaskWorkerForTestingAsync();
          return {
            triggered,
            note: 'A test trigger is not proof of automatic OS scheduling. Read history for completed callbacks.',
          };
        },
      },
    ]),
  };
}
