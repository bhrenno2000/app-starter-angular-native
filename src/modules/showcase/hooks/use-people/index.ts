import * as Contacts from 'expo-contacts';
import * as Calendar from 'expo-calendar';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function usePeople() {
  return useNativeTask([
    {
      id: 'contacts',
      label: 'Read contact names',
      run: async () => {
        if (!(await Contacts.requestPermissionsAsync()).granted)
          throw new Error('Contacts permission was denied.');
        return Contacts.Contact.getAllDetails(
          [Contacts.ContactField.GIVEN_NAME, Contacts.ContactField.FAMILY_NAME],
          { limit: 10 },
        );
      },
    },
    {
      id: 'calendars',
      label: 'List device calendars',
      run: async () => {
        if (!(await Calendar.requestCalendarPermissions()).granted)
          throw new Error('Calendar permission was denied.');
        const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
        return calendars.map((calendar) => ({ id: calendar.id, title: calendar.title }));
      },
    },
    {
      id: 'event',
      label: 'Open native event editor',
      run: async () => {
        if (!(await Calendar.requestCalendarPermissions(true)).granted)
          throw new Error('Calendar permission was denied.');
        const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
        const calendar = calendars.find((entry) => entry.allowsModifications);
        if (!calendar)
          throw new Error(
            'No writable calendar is available. Add a calendar account on this device.',
          );
        return calendar.addEventWithForm({
          title: 'Angular Native demo',
          startDate: new Date(Date.now() + 3600000),
          endDate: new Date(Date.now() + 7200000),
        });
      },
    },
  ]);
}
