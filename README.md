# App Starter Angular Native

## Requirements

- Node 22.23.2 (`nvm use`); Bun 1.4.2.
- Xcode and CocoaPods for iOS, or Android Studio/SDK for Android.
- A development build. Expo Go cannot load this starter's MMKV/Nitro modules.

## Start

```sh
bun install --frozen-lockfile
cp .env.example .env
bun run ios       # builds and opens the iOS app
# or: bun run android
```

Once the development app is installed, use `bun start`. Angular runs through the native Metro preset, not `ng serve`. This starter targets iOS/Android and has no web script.

## Included

- Lazy-loaded feature route lists in `modules/<feature>/routes/index.ts`, native stacks and awaited session guards.
- Login, protected home, logout and restoration of a mock session after restart.
- Signal Forms with email/password validation, loading/disabled/error states.
- Angular signals and hook facades, TanStack Angular Query for server state, and Zustand vanilla persisted through encrypted MMKV.
- Native HttpClient with HTTPS configuration, timeout, response validation and deduplicated token refresh on a 401 (one retry).
- Refresh tokens in device-only SecureStore; access tokens in memory; user metadata and theme preference in AES-256 encrypted MMKV.
- Persisted system/light/dark theme with the original starter's palette, Inter fonts and English UI.
- Button, Card, Form, FormScreenLayout, Header, Icon, Input, Skeleton and Typography primitives implemented as Angular components.
- Vitest component/service/router tests, strict template checking, ESLint and Prettier.

This is a port of the starter's main flows. The original standalone device-secret and biometric helper APIs are not included; the UI did not expose those flows. FlashList, HeroUI Native, Uniwind, Expo Router and React-specific form/state bindings are replaced by native Angular primitives. Skeleton is static; animation/performance/hardware security have not been validated by the Node tests.

## Structure

```text
src/
  app/        shell, application configuration and routes
  core/       providers, initializers, HTTP, storage and theme
  modules/    auth, home and native showcase features
  shared/     reusable components, models and utilities
  main.ts     native bootstrap
```

Use `@/*` for imports outside a feature and relative imports within it. Use kebab-case folders with consistent entry files: `pages/<name>/page.ts`, `services/<name>/service.ts` and `components/<name>/index.ts`. Pages use a sibling `page.html`, components use `index.html`, and the root shell uses `app.html`, all referenced through `templateUrl`. Core infrastructure units use `<name>/index.ts` and `types.ts`; interfaces, named type aliases and domain variants belong in dedicated type files, enforced by ESLint. Models use `<name>/types.ts` with an `index.ts` entry, and utilities use `<name>/index.ts`. Tests live beside each entry as `page.spec.ts`, `service.spec.ts` or `index.spec.ts`. Screen implementations live inside feature modules.

## Verification

```sh
bun run check          # strict types/templates, lint, Vitest and formatting
bun run export         # production bundles for both platforms
```

The test backend accepts any valid email/password shape. In mock mode the email is prefilled; enter a password of at least 6 characters (for example, `password`). Passwords are never prefilled.

Node tests render against fake Fabric. They exercise bindings, validation, events, services and guards, but do not prove native layout, keyboard avoidance, animations or SecureStore/MMKV behavior. Review actual simulator/device results before shipping.

## API configuration

`EXPO_PUBLIC_AUTH_MOCK=true` selects the test backend. Set it to `false` and configure `EXPO_PUBLIC_API_URL` to connect a real HTTPS API. These public variables are bundled into the app and must contain no secrets.

The HTTP adapter expects `/auth/login`, `/auth/refresh`, `/users/me` and `/auth/logout`. Responses may be plain payloads or `{ data: payload }`. Login and refresh return `{ accessToken, refreshToken, expiresIn, user }`; logout returns `null` or `{ data: null }`. User payloads are validated by `userSchema`. Match this contract to your backend before enabling real auth.

The native HTTP provider is `provideNativeHttpClient()`, because the browser fetch backend does not read native response bodies correctly. Route guards improve navigation; server authorization is still required.

## Customization

1. Set application name, slug, scheme and bundle/package identifiers in `app.config.ts`.
2. Edit palette and semantic light/dark tokens in `src/styles.css`.
3. Change the loaded Inter faces in `src/main.ts` and font tokens in `src/styles.css`.
4. Adjust feature routes, backend schemas and API contract for your app.

Tailwind uses `@ng-native/tailwind`, not Uniwind. There is no `tailwind.config.js`; browser preflight is excluded. Native CSS is compiled into a generated global stylesheet on Metro startup. Do not commit `.angular-native`, `.expo`, `ios`, `android`, `dist` or `.env`.

## Local agent instructions

Agent instructions and context files are local-only and ignored: `.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`, `VALIDATION.md` and temporary PR drafts. Angular, native, storage, testing, structure and Git rules are kept locally. No original React-specific skills are carried into the Angular version.

Best-practice sources researched on 2026-09-30: [Angular style guide](https://angular.dev/style-guide), [signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless), [route guards](https://angular.dev/guide/routing/route-guards), [security](https://angular.dev/best-practices/security) and [Angular Native limitations](https://ng-native.com/guide/limitations).

## Native showcase (in development)

The protected `showcase` module preserves login and home, and exposes native demonstrations through hook facades. Current categories cover native maps, WebView messaging, live camera/barcodes, photo-library management, screen/lifecycle controls, camera/media, native video playback, audio, files/PDF, biometrics/security, local notifications and receive/open events, location, sensors, device/system, connectivity, SQLite, contacts/calendar and reversible demo-contact updates, TanStack Query and Zustand/MMKV. Native functionality requires a rebuilt development client; a previously installed starter binary does not contain the new modules.

The catalogue loads without native SDK imports; feature hook creation lives in its own facade. Unknown categories redirect before loading a feature. Back navigation stays outside gesture-consuming scrollable surfaces. Pages and components may import Angular and native rendering primitives. All third-party/native behavior lives in `hooks/<use-name>/index.ts`, with contract types in `types.ts`. ESLint rejects direct library imports in consumers. Native permissions are requested by actions. Screen-bound hardware activity suspends when the screen loses focus or the app enters the background; resources release on destruction. Notification listeners and Query lifecycle synchronization run at application scope.

Camera capture, enrolled biometrics and several sensors require a physical device. Remote push additionally requires native provisioning and a configured project; this showcase is still being expanded and verified. Existing unit tests do not establish hardware parity.

Sources: [Expo SDK](https://docs.expo.dev/versions/latest/), [TanStack Angular Query](https://tanstack.com/query/latest/docs/framework/angular/overview), [Zustand vanilla](https://zustand.docs.pmnd.rs/apis/create-store), [Angular Native](https://ng-native.com/guide/getting-started).

File demonstrations write/read/list app-owned documents, copy the demo file, move it into a subfolder, download and preview a small public Expo package manifest, and open native sharing/PDF sheets. Download requests time out after 20 seconds and abort when the screen loses focus or enters the background. A failed request leaves the previously downloaded document intact.

TanStack demonstrations expose query cache inspection, a deliberate HTTP error, and a simulated JSONPlaceholder mutation. These explicit network actions reject a known offline state, time out after 15 seconds, and cancel client waits when their screen becomes inactive. They use `networkMode: always` after the connectivity guard so a connectivity change cannot silently queue the demonstration. The manually disabled query is marked stale by mutation/invalidation and refetches through its explicit fetch action. Zustand counter and Maps favorites persist in encrypted MMKV; Query cache remains in memory.

Calendar and reminders have their own category. Actions query upcoming events, create an owned demo calendar/event, read and reversibly rename that event, open the native creation editor, and create/read/complete/reopen an owned iOS reminder. Calendar permission is full access because this demonstration reads calendars as well as writes them. iOS creation requires a local calendar source; missing setup is reported explicitly. Android system reminders are unsupported by this SDK and are reported before requesting permissions.

Communication actions check native email/SMS availability, inspect installed mail-client labels, open recipient-free email/SMS drafts and open Angular documentation through the in-app or external browser. The user chooses recipients in the system UI. Composer responses do not verify delivery; Android email handoff has no reliable sent/cancelled result. iOS email requires a physical device with Mail configured, and SMS is unavailable in the iOS simulator. Rebuild the development client after adding these native modules.

## Application setup

Metro defaults to one development bundle (`EXPO_NO_METRO_LAZY=1`) to avoid dynamic fragment requests in the native development client. Angular feature routes still use `loadChildren` and `loadComponent`. An intermittent first transition during simulator automation remains under investigation; full bundling did not eliminate it.

Provider factories live in `src/core/providers/<name>/index.ts`; `application/index.ts` composes the application DI configuration, including the shared icon registry. The Safe Area context lives in `providers/safe-area/index.ts` with its external `index.html` template. Startup tasks live in `src/core/initializers/<name>/index.ts`: native runtime/view registration, awaited font loading, theme restoration, TanStack online/focus synchronization and notification listeners. `app.config.ts` only consumes the provider composition, and `main.ts` only invokes the native runtime initializer.

The video demo includes a six-second animated Angular logo clip derived from the app artwork, so playback works offline. Native actions suspend when their screen loses focus or the app enters the background; pending activation checks prevent late permission/location results from starting hidden hardware listeners.

To register for remote push, set `EXPO_PUBLIC_EAS_PROJECT_ID` to your EAS project ID and provision APNs/FCM credentials in the native client. Registration is explicit and reports missing configuration. Notification listeners run at application scope, retain the last received/opened events and read the last response on startup. Demo scheduling/cancellation and dismissal affect only notifications tagged as showcase-owned.

Maps use Apple Maps on iOS and Google Maps on Android. Set `GOOGLE_MAPS_API_KEY` and rebuild for Android maps. The WebView bundles its local `.htm` document separately from Angular templates, answers the native navigation-decision protocol, allows only its demo origin and validates messages before exposing them. The QR demo uses native image decoding with a bundled fixture; live scanning requires a physical camera. Photo-library demos create their own sample album/images, and contact-name updates target the recorded demo contact.

Sources for these integrations: [Expo Maps](https://docs.expo.dev/versions/latest/sdk/maps/), [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/), [React Native WebView](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md), [Expo MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library/), [Expo Contacts](https://docs.expo.dev/versions/latest/sdk/contacts/), [Expo Calendar](https://docs.expo.dev/versions/v57.0.0/sdk/calendar/), [Expo MailComposer](https://docs.expo.dev/versions/v57.0.0/sdk/mail-composer/), [Expo SMS](https://docs.expo.dev/versions/v57.0.0/sdk/sms/), [ScreenCapture](https://docs.expo.dev/versions/latest/sdk/screen-capture/), [KeepAwake](https://docs.expo.dev/versions/latest/sdk/keep-awake/).
