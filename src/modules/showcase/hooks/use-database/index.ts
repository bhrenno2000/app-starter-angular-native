import { DestroyRef, inject } from '@angular/core';
import { openDatabaseAsync } from 'expo-sqlite';
import { useNativeTask } from '@/core/hooks/use-native-task';
import type { DemoNote, SQLiteDatabase } from './types';
export function useDatabase() {
  let pending: Promise<SQLiteDatabase> | null = null;
  let disposed = false;
  const open = () => {
    if (disposed) throw new Error('Database screen was closed.');
    pending ??= openDatabaseAsync('showcase.db').then(async (db) => {
      await db.execAsync(
        'CREATE TABLE IF NOT EXISTS demo_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, created_at TEXT NOT NULL);',
      );
      return db;
    });
    return pending;
  };
  inject(DestroyRef).onDestroy(() => {
    disposed = true;
    void pending?.then((db) => db.closeAsync()).catch(() => {});
  });
  return useNativeTask([
    {
      id: 'insert',
      label: 'Insert a demo note',
      run: async () => {
        const db = await open();
        const result = await db.runAsync(
          'INSERT INTO demo_notes (message, created_at) VALUES (?, ?)',
          'Created with Angular Native',
          new Date().toISOString(),
        );
        return { id: result.lastInsertRowId };
      },
    },
    {
      id: 'read',
      label: 'Read persisted notes',
      run: async () => {
        const db = await open();
        return db.getAllAsync<DemoNote>('SELECT * FROM demo_notes ORDER BY id DESC LIMIT 20');
      },
    },
    {
      id: 'clear',
      label: 'Clear demo notes',
      run: async () => {
        const db = await open();
        await db.runAsync('DELETE FROM demo_notes');
        return 'Showcase notes removed.';
      },
    },
  ]);
}
