import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { HttpClient } from '@angular/common/http';
import {
  provideQueryClient,
  QueryClient,
  onlineManager,
} from '@tanstack/angular-query-experimental';
import { Observable, of, throwError } from 'rxjs';
import { cleanup, render, waitFor } from '@ng-native/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { useQueryDemo } from './index';
@Component({ selector: 'test-query-hook', template: '' })
class Host {
  readonly demo = useQueryDemo();
}

afterEach(() => {
  cleanup();
  onlineManager.setOnline(true);
});
const lifecycleProviders = () => [
  { provide: SCREEN_IN_FRONT, useValue: signal(true) },
  { provide: AppState, useValue: { active: signal(true) } },
];
test('fetches through the hook and reads the shared query cache without another HTTP request', async () => {
  const http = {
    get: vi.fn(() => of([{ id: 1, title: 'Native task', completed: false }])),
    post: vi.fn(),
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { componentRef } = await render(Host, {
    providers: [
      ...lifecycleProviders(),
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
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
    providers: [
      ...lifecycleProviders(),
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
  });
  const pending = componentRef.instance.demo.perform('fetch');
  expect(http.get).toHaveBeenCalledOnce();
  await client.cancelQueries({ queryKey: ['showcase', 'todos'] });
  await pending;
  expect(cancelled).toHaveBeenCalledOnce();
  componentRef.destroy();
  client.clear();
});

test('mutation invalidates the cached example and identifies the simulated server response', async () => {
  const http = {
    get: vi.fn(() => of([{ id: 1, title: 'Native task', completed: false }])),
    post: vi.fn(() => of({ id: 201, title: 'Angular Native demo' })),
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { componentRef } = await render(Host, {
    providers: [
      ...lifecycleProviders(),
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
  });
  await componentRef.instance.demo.perform('fetch');
  await componentRef.instance.demo.perform('mutation');
  expect(http.post).toHaveBeenCalledOnce();
  expect(JSON.parse(componentRef.instance.demo.output())).toMatchObject({
    response: { id: 201 },
    cacheInvalidated: true,
  });
  expect(componentRef.instance.demo.output()).toContain('not saved on the server');
  expect(http.get).toHaveBeenCalledOnce();
  componentRef.destroy();
  client.clear();
});
test('offline network actions release the busy state while cache reads remain available', async () => {
  const http = { get: vi.fn(), post: vi.fn() };
  const client = new QueryClient();
  client.setQueryData(['showcase', 'todos'], [{ id: 1, title: 'Cached task', completed: false }]);
  const { componentRef } = await render(Host, {
    providers: [
      ...lifecycleProviders(),
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
  });
  onlineManager.setOnline(false);
  await componentRef.instance.demo.perform('fetch');
  expect(componentRef.instance.demo.error()).toContain('offline');
  expect(componentRef.instance.demo.busy()).toBeNull();
  await componentRef.instance.demo.perform('mutation');
  expect(componentRef.instance.demo.busy()).toBeNull();
  expect(http.get).not.toHaveBeenCalled();
  expect(http.post).not.toHaveBeenCalled();
  await componentRef.instance.demo.perform('cached');
  expect(componentRef.instance.demo.error()).toBeNull();
  expect(componentRef.instance.demo.output()).toContain('Cached task');
  componentRef.destroy();
  client.clear();
});
test('surfaces HTTP failures and allows a later successful request', async () => {
  const http = {
    get: vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('HTTP 404')))
      .mockReturnValueOnce(of([{ id: 1, title: 'Recovered task', completed: false }])),
    post: vi.fn(),
  };
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { componentRef } = await render(Host, {
    providers: [
      ...lifecycleProviders(),
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
  });
  await componentRef.instance.demo.perform('http-error');
  expect(componentRef.instance.demo.error()).toContain('HTTP 404');
  await componentRef.instance.demo.perform('fetch');
  expect(componentRef.instance.demo.error()).toBeNull();
  expect(componentRef.instance.demo.output()).toContain('Recovered task');
  componentRef.destroy();
  client.clear();
});

test('backgrounding the screen cancels an in-flight mutation HTTP subscription', async () => {
  const cancelled = vi.fn();
  const foreground = signal(true);
  const http = { get: vi.fn(), post: vi.fn(() => new Observable(() => cancelled)) };
  const client = new QueryClient();
  const { componentRef } = await render(Host, {
    providers: [
      { provide: SCREEN_IN_FRONT, useValue: signal(true) },
      { provide: AppState, useValue: { active: foreground } },
      { provide: HttpClient, useValue: http },
      provideQueryClient(client),
    ],
  });
  const pending = componentRef.instance.demo.perform('mutation');
  await waitFor(() => expect(http.post).toHaveBeenCalledOnce());
  foreground.set(false);
  await waitFor(() => expect(cancelled).toHaveBeenCalledOnce());
  await pending;
  expect(componentRef.instance.demo.busy()).toBeNull();
  expect(componentRef.instance.demo.error()).toContain('may have processed');
  componentRef.destroy();
  client.clear();
});
