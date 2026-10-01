import { defineBackgroundTask } from '@/core/hooks/use-background-task';
export function initializeBackgroundTasks() {
  defineBackgroundTask();
}
