import { inject } from '@angular/core';
import { APP_STORAGE } from '@/core/storage/app-storage';
import * as Contacts from 'expo-contacts';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function usePeople() {
  const storage = inject(APP_STORAGE);
  const key = 'showcase-demo-contact';
  const permitContacts = async () => {
    if (!(await Contacts.requestPermissionsAsync()).granted)
      throw new Error('Contacts permission was denied.');
  };
  const ownedContact = () => {
    const id = storage.get(key);
    if (!id) throw new Error('Create the demo contact first.');
    return new Contacts.Contact(id);
  };

  return useNativeTask([
    {
      id: 'create-contact',
      label: 'Create demo contact',
      run: async () => {
        await permitContacts();
        if (storage.get(key))
          return ownedContact().getDetails([
            Contacts.ContactField.GIVEN_NAME,
            Contacts.ContactField.FAMILY_NAME,
          ]);
        const contact = await Contacts.Contact.create({
          givenName: 'Angular Native',
          familyName: 'Demo',
        });
        storage.set(key, contact.id);
        return { createdContactId: contact.id };
      },
    },
    {
      id: 'read-contact',
      label: 'Read demo contact',
      run: async () => {
        await permitContacts();
        return ownedContact().getDetails([
          Contacts.ContactField.GIVEN_NAME,
          Contacts.ContactField.FAMILY_NAME,
        ]);
      },
    },
    {
      id: 'update-contact',
      label: 'Update demo contact',
      run: async () => {
        await permitContacts();
        const contact = ownedContact();
        await contact.patch({ familyName: 'Updated demo' });
        return contact.getDetails([
          Contacts.ContactField.GIVEN_NAME,
          Contacts.ContactField.FAMILY_NAME,
        ]);
      },
    },
    {
      id: 'restore-contact',
      label: 'Restore demo contact name',
      run: async () => {
        await permitContacts();
        const contact = ownedContact();
        await contact.patch({ familyName: 'Demo' });
        return contact.getDetails([
          Contacts.ContactField.GIVEN_NAME,
          Contacts.ContactField.FAMILY_NAME,
        ]);
      },
    },
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
  ]);
}
