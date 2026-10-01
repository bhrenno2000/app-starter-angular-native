import * as Documents from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useFiles() {
  const folder = new Directory(Paths.document, 'showcase');
  const ensure = () => {
    folder.create({ idempotent: true, intermediates: true });
    return folder;
  };
  return useNativeTask([
    {
      id: 'pick',
      label: 'Pick a document',
      run: async () => {
        const result = await Documents.getDocumentAsync({ copyToCacheDirectory: true });
        return result.canceled
          ? 'Selection cancelled.'
          : result.assets.map(({ name, size, mimeType }) => ({ name, size, mimeType }));
      },
    },
    {
      id: 'write',
      label: 'Write a local file',
      run: () => {
        const file = new File(ensure(), 'angular-native.txt');
        file.create({ overwrite: true });
        file.write('Created by an Angular Native hook.');
        return { uri: file.uri, size: file.size };
      },
    },
    {
      id: 'read',
      label: 'Read the demo file',
      run: async () => {
        const file = new File(ensure(), 'angular-native.txt');
        if (!file.exists) throw new Error('Write the demo file first.');
        return file.text();
      },
    },
    {
      id: 'list',
      label: 'List app files',
      run: () =>
        ensure()
          .list()
          .map((entry) => ({ name: entry.name, uri: entry.uri })),
    },
    {
      id: 'delete',
      label: 'Delete the demo file',
      run: () => {
        const file = new File(ensure(), 'angular-native.txt');
        if (file.exists) file.delete();
        return 'Demo file removed.';
      },
    },
    {
      id: 'pdf',
      label: 'Generate and share PDF',
      run: async () => {
        const pdf = await Print.printToFileAsync({
          html: '<html><body><h1>Angular Native</h1><p>PDF generated on your device.</p></body></html>',
        });
        await Sharing.shareAsync(pdf.uri, { mimeType: 'application/pdf' });
        return { pages: pdf.numberOfPages, uri: pdf.uri };
      },
    },
  ]);
}
