import { inject } from '@angular/core';
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import { APP_STORAGE } from '@/core/storage/app-storage';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
export function useCalendar() {
  const storage = inject(APP_STORAGE);
  const lifecycle = useScreenLifecycle(() => {});
  const eventKey = 'showcase-calendar-event';
  const reminderKey = 'showcase-calendar-reminder';
  const permit = async (entity: Calendar.EntityTypes) => {
    lifecycle.assertActive();
    if (entity === Calendar.EntityTypes.REMINDER && Platform.OS !== 'ios')
      throw new Error(
        'System reminders are supported on iOS. Calendar events are available on both platforms.',
      );
    const permission =
      entity === Calendar.EntityTypes.EVENT
        ? await Calendar.requestCalendarPermissions()
        : await Calendar.requestRemindersPermissions();
    if (!permission.granted) throw new Error('Calendar or reminders permission was denied.');
    lifecycle.assertActive();
  };
  const demoCalendar = async (entity: Calendar.EntityTypes) => {
    const key = `showcase-calendar-${entity}-list`;
    const existing = storage.get(key);
    if (existing) return Calendar.ExpoCalendar.get(existing);
    const title =
      entity === Calendar.EntityTypes.EVENT
        ? 'Angular Native demo events'
        : 'Angular Native demo reminders';
    let sourceId: string | undefined;
    if (Platform.OS === 'ios') {
      sourceId = Calendar.getSourcesSync().find(
        (source) => source.type === Calendar.SourceType.LOCAL,
      )?.id;
      if (!sourceId)
        throw new Error(
          'No local calendar source is available. Configure Calendar or Reminders on this device first.',
        );
    }
    const calendar = await Calendar.createCalendar({
      title,
      entityType: entity,
      color: '#3b82f6',
      ...(Platform.OS === 'ios'
        ? { sourceId }
        : {
            name: 'angular-native-showcase',
            ownerAccount: 'angular-native-showcase',
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
            isVisible: true,
            isSynced: true,
            source: { name: 'Angular Native Showcase', type: 'local', isLocalAccount: true },
          }),
    });
    storage.set(key, calendar.id);
    return calendar;
  };
  const eventSummary = (event: Calendar.ExpoCalendarEvent) => ({
    id: event.id,
    title: event.title,
    calendarId: event.calendarId,
    startDate: event.startDate,
    endDate: event.endDate,
  });
  const reminderSummary = (reminder: Calendar.ExpoCalendarReminder) => ({
    id: reminder.id,
    title: reminder.title,
    calendarId: reminder.calendarId,
    completed: reminder.completed,
    dueDate: reminder.dueDate,
  });
  const ownedEvent = async () => {
    const id = storage.get(eventKey);
    if (!id) throw new Error('Create the demo event first.');
    const event = await Calendar.ExpoCalendarEvent.get(id);
    if (event.calendarId !== storage.get(`showcase-calendar-${Calendar.EntityTypes.EVENT}-list`))
      throw new Error('This event does not belong to the demo calendar.');
    return event;
  };
  const ownedReminder = async () => {
    const id = storage.get(reminderKey);
    if (!id) throw new Error('Create the demo reminder first.');
    const reminder = await Calendar.ExpoCalendarReminder.get(id);
    if (
      reminder.calendarId !== storage.get(`showcase-calendar-${Calendar.EntityTypes.REMINDER}-list`)
    )
      throw new Error('This reminder does not belong to the demo list.');
    return reminder;
  };
  return useNativeTask([
    {
      id: 'calendars',
      label: 'List device calendars',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        return (await Calendar.getCalendars(Calendar.EntityTypes.EVENT)).map((calendar) => ({
          id: calendar.id,
          title: calendar.title,
          writable: calendar.allowsModifications,
        }));
      },
    },
    {
      id: 'upcoming',
      label: 'Read events for the next seven days',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
        if (!calendars.length) return 'No event calendars are available on this device.';
        const events = await Calendar.listEvents(
          calendars,
          new Date(),
          new Date(Date.now() + 7 * 86_400_000),
        );
        return { total: events.length, displayed: events.slice(0, 25).map(eventSummary) };
      },
    },
    {
      id: 'create-calendar',
      label: 'Create demo event calendar',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        const calendar = await demoCalendar(Calendar.EntityTypes.EVENT);
        return { calendarId: calendar.id, title: calendar.title };
      },
    },
    {
      id: 'create-event',
      label: 'Create demo calendar event',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        if (storage.get(eventKey)) return eventSummary(await ownedEvent());
        const calendar = await demoCalendar(Calendar.EntityTypes.EVENT);
        lifecycle.assertActive();
        const event = await calendar.createEvent({
          title: 'Angular Native demo event',
          notes: 'Created by the Angular Native showcase.',
          startDate: new Date(Date.now() + 3_600_000),
          endDate: new Date(Date.now() + 7_200_000),
        });
        storage.set(eventKey, event.id);
        return eventSummary(event);
      },
    },
    {
      id: 'read-event',
      label: 'Read demo calendar event',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        return eventSummary(await ownedEvent());
      },
    },
    {
      id: 'update-event',
      label: 'Update demo event title',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        const event = await ownedEvent();
        lifecycle.assertActive();
        await event.update({ title: 'Updated Angular Native demo event' });
        return eventSummary(await ownedEvent());
      },
    },
    {
      id: 'restore-event',
      label: 'Restore demo event title',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        const event = await ownedEvent();
        lifecycle.assertActive();
        await event.update({ title: 'Angular Native demo event' });
        return eventSummary(await ownedEvent());
      },
    },
    {
      id: 'event-editor',
      label: 'Open native event editor',
      run: async () => {
        await permit(Calendar.EntityTypes.EVENT);
        const calendar = await demoCalendar(Calendar.EntityTypes.EVENT);
        lifecycle.assertActive();
        return calendar.addEventWithForm({
          title: 'Angular Native editor demo',
          startDate: new Date(Date.now() + 3_600_000),
          endDate: new Date(Date.now() + 7_200_000),
        });
      },
    },
    {
      id: 'create-reminder',
      label: 'Create demo reminder (iOS)',
      run: async () => {
        await permit(Calendar.EntityTypes.REMINDER);
        if (storage.get(reminderKey)) return reminderSummary(await ownedReminder());
        const calendar = await demoCalendar(Calendar.EntityTypes.REMINDER);
        lifecycle.assertActive();
        const reminder = await calendar.createReminder({
          title: 'Angular Native demo reminder',
          dueDate: new Date(Date.now() + 86_400_000),
        });
        if (!reminder.id) throw new Error('The system did not return a reminder identifier.');
        storage.set(reminderKey, reminder.id);
        return reminderSummary(reminder);
      },
    },
    {
      id: 'read-reminder',
      label: 'Read demo reminder (iOS)',
      run: async () => {
        await permit(Calendar.EntityTypes.REMINDER);
        return reminderSummary(await ownedReminder());
      },
    },
    {
      id: 'complete-reminder',
      label: 'Complete demo reminder (iOS)',
      run: async () => {
        await permit(Calendar.EntityTypes.REMINDER);
        const reminder = await ownedReminder();
        lifecycle.assertActive();
        await reminder.update({ completed: true });
        return reminderSummary(await ownedReminder());
      },
    },
    {
      id: 'reopen-reminder',
      label: 'Reopen demo reminder (iOS)',
      run: async () => {
        await permit(Calendar.EntityTypes.REMINDER);
        const reminder = await ownedReminder();
        lifecycle.assertActive();
        await reminder.update({ completed: false });
        return reminderSummary(await ownedReminder());
      },
    },
  ]);
}
