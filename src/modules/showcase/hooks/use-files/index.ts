import { signal } from '@angular/core';
import { fetch } from 'expo/fetch';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import * as Documents from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useNativeTask } from '@/core/hooks/use-native-task';
export function useFiles() {
  const reading = signal<string | null>(null);
  let request: AbortController | null = null;
  const lifecycle = useScreenLifecycle(() => request?.abort());
  const folder = new Directory(Paths.document, 'showcase');
  const ensure = () => {
    folder.create({ idempotent: true, intermediates: true });
    return folder;
  };
  const task = useNativeTask([
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
      id: 'copy',
      label: 'Copy the demo file',
      run: async () => {
        const source = new File(ensure(), 'angular-native.txt');
        if (!source.exists) throw new Error('Write the demo file first.');
        const destination = new File(folder, `copy-${Date.now()}.txt`);
        await source.copy(destination);
        return {
          originalExists: source.exists,
          copiedUri: destination.uri,
          size: destination.size,
        };
      },
    },
    {
      id: 'move',
      label: 'Move the demo file into a folder',
      run: async () => {
        const source = new File(ensure(), 'angular-native.txt');
        if (!source.exists) throw new Error('Write the demo file first.');
        const destinationFolder = new Directory(folder, 'moved');
        destinationFolder.create({ idempotent: true });
        const destination = new File(destinationFolder, `demo-${Date.now()}.txt`);
        const originalUri = source.uri;
        await source.move(destination);
        return {
          originalExists: new File(originalUri).exists,
          movedUri: source.uri,
          size: source.size,
        };
      },
    },
    {
      id: 'download',
      label: 'Download an Expo sample document',
      run: async () => {
        lifecycle.assertActive();
        const current = new AbortController();
        request = current;
        const active = lifecycle.checkpoint();
        const timeout = setTimeout(() => current.abort(), 20_000);
        try {
          const response = await fetch(
            'https://raw.githubusercontent.com/expo/expo/main/packages/expo/package.json',
            { signal: current.signal },
          );
          if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}.`);
          const maximum = 1_048_576;
          const declaredSize = Number(response.headers.get('content-length'));
          if (declaredSize > maximum)
            throw new Error('The sample document exceeds the 1 MB limit.');
          const bytes = new Uint8Array(await response.arrayBuffer());
          if (bytes.byteLength > maximum)
            throw new Error('The sample document exceeds the 1 MB limit.');
          if (!active()) return 'Download cancelled because this screen is no longer active.';
          const file = new File(ensure(), 'expo-package.json');
          file.create({ overwrite: true });
          file.write(bytes);
          reading.set((await file.text()).slice(0, 2_000));
          return { uri: file.uri, bytes: file.size, previewCharacters: 2_000 };
        } catch (cause) {
          if (current.signal.aborted) return 'Download cancelled or timed out.';
          throw cause;
        } finally {
          clearTimeout(timeout);
          if (request === current) request = null;
        }
      },
    },
    {
      id: 'preview-download',
      label: 'Read the downloaded document',
      run: async () => {
        const file = new File(ensure(), 'expo-package.json');
        if (!file.exists) throw new Error('Download the sample document first.');
        reading.set((await file.text()).slice(0, 2_000));
        return { uri: file.uri, bytes: file.size };
      },
    },
    {
      id: 'share',
      label: 'Share the demo text file',
      run: async () => {
        const file = new File(ensure(), 'angular-native.txt');
        if (!file.exists) throw new Error('Write the demo file first.');
        if (!(await Sharing.isAvailableAsync())) throw new Error('Native sharing is unavailable.');
        await Sharing.shareAsync(file.uri, { mimeType: 'text/plain', UTI: 'public.plain-text' });
        return 'The native share sheet closed.';
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
  return { ...task, reading: reading.asReadonly() };
}
