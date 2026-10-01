import { HttpClient } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { firstValueFrom, fromEvent, takeUntil } from 'rxjs';
import { injectQuery, QueryClient, injectMutation } from '@tanstack/angular-query-experimental';
import { z } from 'zod';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useQueryDemo() {
  const http = inject(HttpClient);
  const client = inject(QueryClient);
  const schema = z.array(z.object({ id: z.number(), title: z.string(), completed: z.boolean() }));
  const query = injectQuery(() => ({
    queryKey: ['showcase', 'todos'],
    enabled: false,
    queryFn: async ({ signal }) => {
      if (signal.aborted) throw new Error('Query cancelled.');
      return schema.parse(
        await firstValueFrom(
          http
            .get<unknown>('https://jsonplaceholder.typicode.com/todos?_limit=5')
            .pipe(takeUntil(fromEvent(signal, 'abort'))),
        ),
      );
    },
  }));
  const mutation = injectMutation(() => ({
    mutationFn: async () => {
      const result = await firstValueFrom(
        http.post<unknown>('https://jsonplaceholder.typicode.com/todos', {
          title: 'Angular Native demo',
          completed: false,
          userId: 1,
        }),
      );
      return z.object({ id: z.number(), title: z.string() }).parse(result);
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ['showcase', 'todos'] }),
  }));
  const data = computed(() =>
    JSON.stringify(
      {
        status: query.status(),
        fetching: query.isFetching(),
        data: query.data(),
        error: query.error()?.message,
        updatedAt: query.dataUpdatedAt(),
      },
      null,
      2,
    ),
  );
  return {
    reading: data,
    ...useNativeTask([
      {
        id: 'fetch',
        label: 'Fetch and cache todos',
        run: async () => {
          const result = await query.refetch({ throwOnError: true });
          return result.data;
        },
      },
      {
        id: 'cached',
        label: 'Read TanStack cache',
        run: () => client.getQueryData(['showcase', 'todos']) ?? 'Fetch the example first.',
      },
      { id: 'mutation', label: 'Run example mutation', run: () => mutation.mutateAsync() },
      {
        id: 'invalidate',
        label: 'Invalidate cached query',
        run: async () => {
          await client.invalidateQueries({ queryKey: ['showcase', 'todos'] });
          return 'Query marked stale.';
        },
      },
      {
        id: 'clear',
        label: 'Remove example cache',
        run: () => {
          client.removeQueries({ queryKey: ['showcase', 'todos'] });
          return 'Example cache removed.';
        },
      },
    ]),
  };
}
