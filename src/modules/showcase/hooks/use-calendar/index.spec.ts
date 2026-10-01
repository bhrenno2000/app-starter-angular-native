import { Component, signal } from '@angular/core';
import { AppState, SCREEN_IN_FRONT } from '@ng-native/device';
import { cleanup, render } from '@ng-native/testing';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { MemoryStorage } from '@/core/testing/memory-storage';
import { useCalendar } from './index';
const native = vi.hoisted(() => ({
  platform: { OS: 'ios' },
  permission: vi.fn(),
  remindersPermission: vi.fn(),
  createCalendar: vi.fn(),
  getCalendar: vi.fn(),
  createEvent: vi.fn(),
  getEvent: vi.fn(),
  getReminder: vi.fn(),
  updateEvent: vi.fn(),
  sources: vi.fn(),
}));
vi.mock('react-native', () => ({ Platform: native.platform }));
vi.mock('expo-calendar', () => ({
  EntityTypes: { EVENT: 'event', REMINDER: 'reminder' },
  SourceType: { LOCAL: 'local' },
  CalendarAccessLevel: { OWNER: 'owner' },
  requestCalendarPermissions: native.permission,
  requestRemindersPermissions: native.remindersPermission,
  getSourcesSync: native.sources,
  createCalendar: native.createCalendar,
  ExpoCalendar: { get: native.getCalendar },
  ExpoCalendarEvent: { get: native.getEvent },
  ExpoCalendarReminder: { get: native.getReminder },
}));
@Component({ selector: 'test-calendar-hook', template: '' })
class Host {
  readonly demo = useCalendar();
}
afterEach(cleanup);
beforeEach(() => {
  vi.resetAllMocks();
  native.platform.OS = 'ios';
  native.permission.mockResolvedValue({ granted: true });
  native.remindersPermission.mockResolvedValue({ granted: true });
  native.sources.mockReturnValue([{ id: 'local-source', type: 'local' }]);
  const calendar = {
    id: 'demo-calendar',
    title: 'Angular Native demo events',
    createEvent: native.createEvent,
  };
  native.createCalendar.mockResolvedValue(calendar);
  native.getCalendar.mockResolvedValue(calendar);
  const event = {
    id: 'demo-event',
    calendarId: 'demo-calendar',
    title: 'Angular Native demo event',
    update: native.updateEvent,
  };
  native.createEvent.mockResolvedValue(event);
  native.getEvent.mockResolvedValue(event);
});
async function setup(storage = new MemoryStorage()) {
  return render(Host, {
    providers: [
      { provide: APP_STORAGE, useValue: storage },
      { provide: SCREEN_IN_FRONT, useValue: signal(true) },
      { provide: AppState, useValue: { active: signal(true) } },
    ],
  });
}
test('creates one owned calendar/event and reuses recorded identifiers on repeated actions', async () => {
  const storage = new MemoryStorage();
  const { componentRef } = await setup(storage);
  await componentRef.instance.demo.perform('create-event');
  await componentRef.instance.demo.perform('create-event');
  expect(native.createCalendar).toHaveBeenCalledOnce();
  expect(native.createEvent).toHaveBeenCalledOnce();
  expect(native.createCalendar).toHaveBeenCalledWith(
    expect.objectContaining({ sourceId: 'local-source', entityType: 'event' }),
  );
  expect(storage.get('showcase-calendar-event')).toBe('demo-event');
  expect(JSON.parse(componentRef.instance.demo.output())).toMatchObject({
    id: 'demo-event',
    calendarId: 'demo-calendar',
  });
});
test('denied calendar permission prevents creating any native records', async () => {
  native.permission.mockResolvedValue({ granted: false });
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('create-event');
  expect(componentRef.instance.demo.error()).toContain('permission was denied');
  expect(native.createCalendar).not.toHaveBeenCalled();
  expect(native.createEvent).not.toHaveBeenCalled();
});
test('refuses to edit an event outside the recorded demo calendar', async () => {
  const storage = new MemoryStorage();
  storage.set('showcase-calendar-event', 'foreign-event');
  storage.set('showcase-calendar-event-list', 'demo-calendar');
  native.getEvent.mockResolvedValue({
    id: 'foreign-event',
    calendarId: 'other-calendar',
    update: native.updateEvent,
  });
  const { componentRef } = await setup(storage);
  await componentRef.instance.demo.perform('update-event');
  expect(componentRef.instance.demo.error()).toContain('does not belong');
  expect(native.updateEvent).not.toHaveBeenCalled();
});
test('reports Android reminder unavailability before requesting unsupported permissions', async () => {
  native.platform.OS = 'android';
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('create-reminder');
  expect(componentRef.instance.demo.error()).toContain('supported on iOS');
  expect(native.remindersPermission).not.toHaveBeenCalled();
  expect(native.createCalendar).not.toHaveBeenCalled();
});

test('does not create a calendar in a remote account when no local source is available', async () => {
  native.sources.mockReturnValue([{ id: 'remote-source', type: 'caldav' }]);
  const { componentRef } = await setup();
  await componentRef.instance.demo.perform('create-calendar');
  expect(componentRef.instance.demo.error()).toContain('No local calendar source');
  expect(native.createCalendar).not.toHaveBeenCalled();
});
