import { defineBackgroundLocation } from '@/core/hooks/use-background-location';
import { defineBackgroundTask } from '@/core/hooks/use-background-task';
export function initializeBackgroundTasks() {
  defineBackgroundTask();
  defineBackgroundLocation();
}
