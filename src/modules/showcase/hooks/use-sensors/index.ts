import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import { signal } from '@angular/core';
import { Accelerometer, Gyroscope, Magnetometer, Pedometer } from 'expo-sensors';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useSensors() {
  const reading = signal<string | null>(null);
  let release: (() => void) | null = null;
  const stop = () => {
    release?.();
    release = null;
    return 'Sensor listener stopped.';
  };
  const lifecycle = useScreenLifecycle(stop);
  const listen = async (sensor: typeof Accelerometer) => {
    lifecycle.assertActive();
    const active = lifecycle.checkpoint();
    stop();
    if (!(await sensor.isAvailableAsync()))
      throw new Error('This sensor is unavailable on this device.');
    if (!active()) return 'Sensor activation cancelled because this screen is no longer active.';
    sensor.setUpdateInterval(300);
    const subscription = sensor.addListener((value) => reading.set(JSON.stringify(value)));
    release = () => subscription.remove();
    return 'Sensor listener active. It stops when you leave this page.';
  };
  return {
    reading: reading.asReadonly(),
    ...useNativeTask([
      { id: 'accelerometer', label: 'Read accelerometer live', run: () => listen(Accelerometer) },
      { id: 'gyroscope', label: 'Read gyroscope live', run: () => listen(Gyroscope) },
      { id: 'magnetometer', label: 'Read magnetometer live', run: () => listen(Magnetometer) },
      {
        id: 'steps',
        label: 'Read step count today',
        run: async () => {
          if (!(await Pedometer.isAvailableAsync()))
            throw new Error('Step counting is unavailable on this device.');
          const from = new Date();
          from.setHours(0, 0, 0, 0);
          return Pedometer.getStepCountAsync(from, new Date());
        },
      },
      { id: 'stop', label: 'Stop live sensor', run: stop },
    ]),
  };
}
