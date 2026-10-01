import { HttpClient } from '@angular/common/http';
import { computed, inject, signal } from '@angular/core';
import { firstValueFrom, fromEvent, takeUntil, timeout } from 'rxjs';
import {
  injectQuery,
  QueryClient,
  injectMutation,
  onlineManager,
} from '@tanstack/angular-query-experimental';
import { z } from 'zod';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useQueryDemo() {
  const http = inject(HttpClient);
  const client = inject(QueryClient);
  const requests = signal(0);
  let mutationRequest: AbortController | null = null;
  const lifecycle = useScreenLifecycle(() => {
    mutationRequest?.abort();
    void client.cancelQueries({ queryKey: ['showcase', 'todos'] });
    void client.cancelQueries({ queryKey: ['showcase', 'http-error'] });
  });
  const requireConnection = () => {
    lifecycle.assertActive();
    if (!onlineManager.isOnline())
      throw new Error('The device is offline. Read the cache or reconnect before requesting data.');
  };
  const schema = z.array(z.object({ id: z.number(), title: z.string(), completed: z.boolean() }));
  const query = injectQuery(() => ({
    queryKey: ['showcase', 'todos'],
    enabled: false,
    networkMode: 'always',
    retry: false,
    queryFn: async ({ signal }) => {
      requests.update((value) => value + 1);
      if (signal.aborted) throw new Error('Query cancelled.');
      return schema.parse(
        await firstValueFrom(
          http
            .get<unknown>('https://jsonplaceholder.typicode.com/todos?_limit=5')
            .pipe(takeUntil(fromEvent(signal, 'abort')), timeout(15_000)),
        ),
      );
    },
  }));
  const mutation = injectMutation(() => ({
    networkMode: 'always',
    mutationFn: async () => {
      requireConnection();
      const controller = new AbortController();
      mutationRequest = controller;
      try {
        const result = await firstValueFrom(
          http
            .post<unknown>('https://jsonplaceholder.typicode.com/todos', {
              title: 'Angular Native demo',
              completed: false,
              userId: 1,
            })
            .pipe(takeUntil(fromEvent(controller.signal, 'abort')), timeout(15_000)),
        );
        return z.object({ id: z.number(), title: z.string() }).parse(result);
      } catch (cause) {
        if (controller.signal.aborted)
          throw new Error(
            'Stopped waiting after leaving this screen. The demo server may have processed the request.',
          );
        throw cause;
      } finally {
        if (mutationRequest === controller) mutationRequest = null;
      }
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
        queryNetworkRequests: requests(),
        mutationStatus: mutation.status(),
        mutationPaused: mutation.isPaused(),
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
          requireConnection();
          const result = await query.refetch({ throwOnError: true });
          return result.data;
        },
      },
      {
        id: 'cached',
        label: 'Read TanStack cache',
        run: () => client.getQueryData(['showcase', 'todos']) ?? 'Fetch the example first.',
      },
      {
        id: 'mutation',
        label: 'Run example mutation',
        run: async () => {
          requireConnection();
          return {
            response: await mutation.mutateAsync(),
            persistence:
              'JSONPlaceholder simulates creation; this record is not saved on the server.',
            cacheInvalidated: client.getQueryState(['showcase', 'todos'])?.isInvalidated ?? false,
          };
        },
      },
      {
        id: 'inspect',
        label: 'Inspect query cache',
        run: () => {
          const state = client.getQueryState(['showcase', 'todos']);
          return {
            online: onlineManager.isOnline(),
            queryNetworkRequests: requests(),
            cachedItems: schema.safeParse(state?.data).data?.length ?? 0,
            invalidated: state?.isInvalidated ?? false,
            updatedAt: state?.dataUpdatedAt ?? null,
          };
        },
      },
      {
        id: 'http-error',
        label: 'Demonstrate an HTTP error',
        run: async () => {
          requireConnection();
          return client.fetchQuery({
            queryKey: ['showcase', 'http-error'],
            networkMode: 'always',
            retry: false,
            queryFn: ({ signal }) =>
              firstValueFrom(
                http
                  .get<unknown>('https://jsonplaceholder.typicode.com/showcase-missing-resource')
                  .pipe(takeUntil(fromEvent(signal, 'abort')), timeout(15_000)),
              ),
          });
        },
      },
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
