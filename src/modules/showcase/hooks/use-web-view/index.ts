import { TurboModuleRegistry } from 'react-native';
import type { NativeWebViewModule } from './types';
import { signal } from '@angular/core';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { z } from 'zod';
import { useNativeTask } from '@/core/hooks/use-native-task';
import { useScreenLifecycle } from '@/core/hooks/use-screen-lifecycle';
import type { WebDocument } from '@/shared/components/native-web-view/types';
export function useWebView() {
  const document = signal<WebDocument | null>(null);
  const reading = signal<string | null>(null);
  const lifecycle = useScreenLifecycle(() => document.set(null));
  const load = async () => {
    lifecycle.assertActive();
    const active = lifecycle.checkpoint();
    const asset = Asset.fromModule(require('../../../../../assets/html/webview-demo.htm'));
    await asset.downloadAsync();
    if (!asset.localUri) throw new Error('The embedded document could not be loaded.');
    const html = await new File(asset.localUri).text();
    if (!active()) return 'Document loading cancelled because this screen is no longer active.';
    document.set({
      html: html + `<!-- instance-${Date.now()} -->`,
      baseUrl: 'https://showcase.local',
    });
    reading.set('Waiting for the native browser to finish loading.');
    return 'Embedded document requested. Tap its button to send a message to Angular.';
  };
  return {
    web: {
      navigation: (event: unknown) => {
        const request = z
          .object({ nativeEvent: z.object({ url: z.string(), lockIdentifier: z.number() }) })
          .safeParse(event);
        if (!request.success) {
          reading.set('The browser sent an invalid navigation request.');
          return;
        }
        const bridge = TurboModuleRegistry.get<NativeWebViewModule>('RNCWebViewModule');
        if (!bridge) {
          reading.set('The native WebView bridge is unavailable. Rebuild the development client.');
          return;
        }
        const url = request.data.nativeEvent.url;
        let allowed = url === 'about:blank';
        try {
          allowed ||= new URL(url).origin === 'https://showcase.local';
        } catch {
          allowed = false;
        }
        bridge.shouldStartLoadWithLockIdentifier(allowed, request.data.nativeEvent.lockIdentifier);
        if (!allowed) reading.set('This demonstration only loads its local document.');
      },
      document: document.asReadonly(),
      message: (event: unknown) => {
        const parsed = z
          .object({ nativeEvent: z.object({ data: z.string().max(4096) }) })
          .safeParse(event);
        if (!parsed.success) {
          reading.set('The browser sent an invalid message.');
          return;
        }
        try {
          const message = z
            .object({ type: z.literal('counter'), value: z.number().int().min(1) })
            .parse(JSON.parse(parsed.data.nativeEvent.data));
          reading.set(JSON.stringify({ receivedFrom: 'Native WebView', ...message }, null, 2));
        } catch {
          reading.set('The browser message did not match the demo contract.');
        }
      },
      loaded: () =>
        reading.set('Native WebView loaded. Tap Send message to Angular inside the document.'),
      failed: (event: unknown) => {
        const parsed = z
          .object({ nativeEvent: z.object({ description: z.string() }) })
          .safeParse(event);
        reading.set(
          parsed.success
            ? parsed.data.nativeEvent.description
            : 'The native browser could not load the document.',
        );
      },
    },
    reading: reading.asReadonly(),
    ...useNativeTask([
      { id: 'load', label: 'Load embedded web document', run: load },
      { id: 'reload', label: 'Reload web document', run: load },
      {
        id: 'close',
        label: 'Close embedded browser',
        run: () => {
          document.set(null);
          return 'Embedded browser removed.';
        },
      },
    ]),
  };
}
