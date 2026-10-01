import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { Observable, of } from 'rxjs';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useQueryDemo } from './index';
@Component({ selector: 'test-query-hook', template: '' })
class Host {
  readonly demo = useQueryDemo();
}

afterEach(cleanup);
test('fetches through the hook and reads the shared query cache without another HTTP request', async () => {
  const http = {
    get: vi.fn(() => of([{ id: 1, title: 'Native task', completed: false }])),
    post: vi.fn(),
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { componentRef } = await render(Host, {
    providers: [{ provide: HttpClient, useValue: http }, provideQueryClient(client)],
  });
  await componentRef.instance.demo.perform('fetch');
  await componentRef.instance.demo.perform('cached');
  expect(http.get).toHaveBeenCalledTimes(1);
  expect(JSON.parse(componentRef.instance.demo.output())).toEqual([
    { id: 1, title: 'Native task', completed: false },
  ]);
  componentRef.destroy();
  client.clear();
});

test('cancelling the query unsubscribes its in-flight HTTP request', async () => {
  const cancelled = vi.fn();
  const http = { get: vi.fn(() => new Observable(() => cancelled)), post: vi.fn() };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { componentRef } = await render(Host, {
    providers: [{ provide: HttpClient, useValue: http }, provideQueryClient(client)],
  });
  const pending = componentRef.instance.demo.perform('fetch');
  expect(http.get).toHaveBeenCalledOnce();
  await client.cancelQueries({ queryKey: ['showcase', 'todos'] });
  await pending;
  expect(cancelled).toHaveBeenCalledOnce();
  componentRef.destroy();
  client.clear();
});
