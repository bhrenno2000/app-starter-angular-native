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
3. Change the loaded Inter faces in `src/core/initializers/fonts/index.ts` and font tokens in `src/styles.css`.
4. Adjust feature routes, backend schemas and API contract for your app.

Tailwind uses `@ng-native/tailwind`, not Uniwind. There is no `tailwind.config.js`; browser preflight is excluded. Native CSS is compiled into a generated global stylesheet on Metro startup. Do not commit `.angular-native`, `.expo`, `ios`, `android`, `dist` or `.env`.

## Local agent instructions

Agent instructions and context files are local-only and ignored: `.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md`, `DESIGN.md`, `VALIDATION.md` and temporary PR drafts. Angular, native, storage, testing, structure and Git rules are kept locally. No original React-specific skills are carried into the Angular version.

Best-practice sources researched on 2026-09-30: [Angular style guide](https://angular.dev/style-guide), [signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless), [route guards](https://angular.dev/guide/routing/route-guards), [security](https://angular.dev/best-practices/security) and [Angular Native limitations](https://ng-native.com/guide/limitations).

## Native showcase (in development)

The protected `showcase` module preserves login and home, and exposes native demonstrations through hook facades. Current categories cover native gestures/worklets, background location, background tasks, NFC tags, Bluetooth BLE, native maps, WebView messaging, live camera/barcodes, photo-library management, screen/lifecycle controls, camera/media, native video playback, audio, files/PDF, biometrics/security, local notifications and receive/open events, location, sensors, device/system, connectivity, SQLite, contacts/calendar and reversible demo-contact updates, TanStack Query and Zustand/MMKV. Native functionality requires a rebuilt development client; a previously installed starter binary does not contain the new modules.

The catalogue searches category names, identifiers and descriptions case-insensitively, shows the matching count, and provides clear-search and empty-result states. The search stays outside the scroll view. Home exposes pending showcase navigation and ignores stale failures after a later successful attempt. The catalogue loads without native SDK imports; feature hook creation lives in its own facade. Unknown categories redirect before loading a feature. Back navigation stays outside gesture-consuming scrollable surfaces. Pages and components may import Angular and native rendering primitives. All third-party/native behavior lives in `hooks/<use-name>/index.ts`, with contract types in `types.ts`. ESLint rejects direct library imports in consumers. Native permissions are requested by actions. Screen-bound hardware activity suspends when the screen loses focus or the app enters the background; resources release on destruction. Notification listeners and Query lifecycle synchronization run at application scope.

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

## Incoming app links

`appstarterangular://showcase/communication` opens a protected demonstration. The application link provider delegates launch and live URL delivery to a hook, validates known home/showcase destinations, and ignores unsupported schemes, unknown categories, query strings and fragments. The native router builds home → catalogue → demonstration ancestry through `withLinkParent`. Unauthenticated users reach login with a validated temporary return destination; successful sign-in rebuilds the native stack and resumes that destination.

Feature modules own their full route paths. The root lazily composes their route lists beneath one shared componentless parent; changing componentless feature parents would deactivate the shared native outlet and discard the home screen. Page components remain lazy-loaded. The communication demonstration can copy its own app link to the native clipboard.

Custom schemes are configured already. HTTPS Universal Links/App Links require an owned domain and platform association files before they can be supported. Expo development clients may open their launcher instead of loading a bundle when started directly by an app link; standalone signed iOS Release validation verified cold links, restored mock authentication and back navigation through catalogue/home.

References: [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/), [linking into your app](https://docs.expo.dev/linking/into-your-app/).

Startup splash ownership lives in `core/initializers/splash`: hold the splash while fonts load, then hide it after the first successful Angular navigation and render. Simulator Release builds require local ad hoc signing (`CODE_SIGNING_ALLOWED=YES CODE_SIGN_IDENTITY=-`) to retain SecureStore access to the existing MMKV encryption key. An unsigned build failed Keychain access; rebuilding with signing restored startup without clearing keys or app data.

## Motion and system chrome

The Motion & layout category animates translation and opacity through React Native `Animated` with `useNativeDriver: true`, bound by the Angular Native `AnimatedStyle` rendering directive. Its hook stops active animations when the screen loses focus, the app backgrounds or the screen is destroyed. Native iOS Release video analysis verified 53 marker positions from x=84 to x=504 pixels during the 900 ms movement. LayoutAnimation panel/row requests remain experimental: state changes passed, but captured Debug/Release video did not prove intermediate layout frames.

Status-bar styling initializes centrally and follows the effective appearance: light content on dark backgrounds and dark content on light backgrounds. iOS is configured for the imperative status-bar API through `UIViewControllerBasedStatusBarAppearance: false`.

Bluetooth BLE uses `react-native-ble-plx` behind `hooks/use-ble`. The demonstration provides adapter inspection, a bounded advertisement scan, explicit peripheral selection/connection, GATT discovery, characteristic reads and notifications, and disconnection. Values are displayed as base64; no characteristic writes or automatic connections are performed. Android scan/connect and location permissions are requested on explicit activation. Background BLE is disabled, and native resources are released when the screen becomes inactive. A rebuilt native app is required. A signed iOS Release simulator check confirmed `nativeModuleLinked: true`, `physicalDevice: false` and `radioCommunicationVerified: false`, and the scan action reported the physical-device requirement. Simulator inspection can prove module registration only; scanning and GATT communication require a physical device and a nearby BLE peripheral. Source: [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx).

The local Expo status-bar config plugin runs after Angular Native’s generated controller-based setting, preserving the application-owned theme synchronization across prebuilds.

NFC uses the New Architecture `react-native-nfc-manager` 4.0.0-beta.9 package behind `hooks/use-nfc`; this dependency is experimental. Actions inspect native/NDEF support, read a foreground NDEF tag with a 20-second deadline, and open Android NFC settings. The hook exposes cancellation independently from the action lock, prevents overlapping unfinished native requests, and cancels sessions on screen loss/background/destruction. Tag IDs, technologies, text, URI and raw/malformed record previews are shown locally; links are never opened automatically. Signed iOS Release simulator validation confirmed native module registration and the physical-device requirement on the read action; this does not verify tag communication. No tag writes or background tag handling are implemented yet. The Expo plugin adds the iOS usage description/reader entitlements and Android NFC permission. Real iOS devices require NFC capability in their provisioning profile; an NFC-capable device and tag are needed for radio validation. Source: [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager).

iOS simulator validation opened and dismissed the native text-file and PDF share sheets without choosing a recipient, then confirmed each hook completed. The generated PDF was inspected as a valid one-page PDF 1.3 document (37,623 bytes). A separate XCTest hierarchy-session startup while a share sheet was open crashed in the automation framework; the continuous text/PDF flow passed. Android sharing and physical-device regression remain pending.

Background tasks use `expo-background-task` and `expo-task-manager` behind `core/hooks/use-background-task`. `core/initializers/background-tasks` defines the callback synchronously at bundle startup, before fonts and mounting, so it can run without an Angular application injector. Registration is explicit, persists across screen/app transitions, and unregisters only the showcase task. The native callback records a timestamp in a dedicated SQLite journal; the most recent 25 records remain. Each operation owns its database connection and closes it after completion or failure.

The operating system determines background execution timing; the requested 15-minute minimum is inexact and iOS may defer execution for much longer. iOS scheduling requires a physical device. The foreground journal preview is labelled separately from native callbacks and does not prove scheduling. The native test trigger is available only in development builds; a test trigger also does not prove automatic scheduling. Native/hardware execution remains pending. Sources: [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/) and [Expo TaskManager](https://docs.expo.dev/versions/latest/sdk/task-manager/).

Signed iOS Release simulator checks confirmed the task was defined at bundle startup and TaskManager was available. A foreground-preview record was written to the dedicated SQLite journal and restored after a cold app restart. iOS simulator registration was refused and the Release build rejected the development-only worker trigger; these checks do not prove OS background execution. A separate native media test selected the Angular demo image through the system picker, rendered and previewed a real JPEG, and verified its file dimensions as 720 × 720 pixels. Physical camera/video capture and Android media processing remain unverified.

A standalone picker-inspection flow also produced an XCTest accessibility initialization crash after leaving the system picker open. The continuous selection/resize flow passed; normal-app stability outside automation is not established by these checks.

Background location uses a core hook and a task defined by the existing startup initializer. Explicit activation requests foreground permission before background permission, checks active screen/session checkpoints, and releases a late native activation. Tracking is application-owned after activation and persists beyond the page until explicitly stopped or signed out. Android uses a visible foreground-service notification and the existing white/transparent Angular icon. iOS uses background-location capability and an Always permission description.

Coordinates are held only in memory. A separate SQLite journal records callback arrival time and sample count, retaining at most 50 entries; it stores no precise coordinates. Native payloads are validated before updating the facade. Stop/sign-out invalidates pending activation and clears memory coordinates; failed stopping blocks further delivery in the current runtime and presents settings guidance. Local sign-out and refresh-token removal still complete if resource cleanup fails. Task availability, callback delivery, background behavior and termination policies require platform/device validation; no physical reception is claimed. Source: [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/).

Location activation persists an explicit opt-in marker; stop and session cleanup persist opt-out before native release. Callbacks check this marker after JavaScript restarts and attempt to close an inactive native task, preventing a failed native stop from silently re-enabling data processing. If intent persistence fails, native stop is still attempted and cleanup failure remains visible. The cold-runtime regression reproduced processing without this guard and now passes.

Signed iOS Release simulator validation started background-location tracking and received native TaskManager callbacks along an explicitly injected simulator route. The callback journal contained arrival timestamps and sample counts only. Explicit stop cleared memory coordinates and persisted opt-out. Signing out while tracking released the native task; after signing in again, inspection confirmed tracking and desiredTracking were both false. This verifies simulator callback plumbing and cleanup, not physical GPS reception, OS wake-up or Android behavior.

Notification simulator checks tapped a delivered local-notification banner while the app was running in the background, then repeated the interaction after terminating the app. The cold launch exposed a native opened response through the application-owned hook. Event history is process-scoped; a normal launch without a notification interaction returned no previous response. Regression coverage distinguishes receipt from opening, restores launch responses, clears native history and releases listeners, and prevents cancellation/dismissal of unrelated notifications. Remote push provisioning/delivery and Android/physical-device notification behavior remain unverified.

The simulator cleanup flow dismissed delivered demo notifications and read an empty delivered list, scheduled a demo and requested cancellation before reading an empty pending list, then cleared event history and confirmed null receive/open summaries after restart. The native cancellation observation is the resulting empty queue; ownership boundaries are additionally covered by SDK-mocked regressions.

## Native gestures and worklets

The Gestures & worklets category uses Expo-compatible Gesture Handler 2.32, Reanimated 4.5.1 and Worklets 0.10.1 through `hooks/use-interactions`. The application wraps its native outlet in one `core/providers/gestures` component. Pages import only the Angular Native rendering directives and consume the hook facade.

Pan/pinch update bounded shared values on the UI runtime; completed gestures report compact summaries to Angular through `scheduleOnRN`. A separate target demonstrates exclusive tap and 650 ms long press. An explicit action requests a Reanimated spring. Screen loss/background/destruction cancels animation and invalidates gesture epochs; interactions automatically resume on screen activation without accepting an old completion. Reset clears the preview state. Lifecycle cleanup runs untracked so cleanup state never becomes a dependency of the lifecycle effect.

The published Angular Native 0.2 test runner resolves gesture/worklet stand-ins to missing `src` files. The project test configuration aliases those entries to the package's shipped `dist` stand-ins. Node regressions exercise bounds, successful press handling, stale completions and ownership destruction; they do not establish native recognition or smooth frames. Signed iOS Release simulator validation passed tap, long press, bounded pan, the spring preview and background/foreground resumption. A native startup activation gap was reproduced and fixed by synchronizing gesture enablement with screen activity. Android Release checks also passed native tap and bounded pan. Actual multitouch pinch, intermediate-frame performance, Android long press/spring resumption and physical-device gestures remain unverified.

References: [Angular Native gestures](https://ng-native.com/packages/components/gestures), [Angular Native animation](https://ng-native.com/packages/components/animation), [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture/) and [Worklets threading](https://docs.swmansion.com/react-native-worklets/docs/0.10-0.12/threading/scheduleOnRN/).

## Native lists

The Native lists category renders a windowed `VirtualList` with generated local sample data, 20-item batches capped at 200, explicit reload, item selection and favorites. Its feature component consumes the hook facade and native rendering primitives. Stable item keys identify data while slot tracking recycles views; selection/favorite state stays in the hook rather than in a recycled row. Filtering away the selected item clears that selection, and reload preserves favorites within the current screen lifetime.

A component regression scrolls a 200-item fixture, verifies fewer rendered button nodes, checks the recycled item/favorite label and selects the new item without carrying the old selection. This exercises fake Fabric windowing and bindings; signed iOS Release checks verified native scrolling, favorite selection/filtering, an accessible empty state and explicit pagination from 20 to 40 samples. The empty state uses a separate container because zero-height virtual content made its text visually present but unavailable to accessibility. A compound automation flow later tapped a clipped pagination button without activating it; a fresh isolated pagination/scroll flow passed and its screenshots confirmed 40 loaded samples and rows 5–8 after scrolling. Android Release checks also passed pagination to 40 samples and native scrolling. Android favorite/filter/empty-state, physical-device and broader performance validation remain pending. Tailwind scans feature components and provider wrappers as well as pages. Source: [Angular Native lists](https://ng-native.com/packages/components/lists).

Android native Release compilation passed with Java 17, SDK/target API 36, NDK 27.1 and the `arm64-v8a` ABI. The 62 MB APK uses the generated local debug signing configuration for QA. The dedicated API 36.1 emulator subsequently booted and passed the scoped runtime checks below. Existing physical-device limitations remain.

Android Release runtime checks now passed on the dedicated API 36.1 ARM emulator: mock login/home, local-list pagination to 40 samples and scrolling, native tap/pan, cold authentication restoration, Zustand/MMKV counter persistence and app-owned SecureStore secret existence after restart. Secret values were never displayed. The initial generated AVD had `target=android-0`; correcting it to match the image restored API 36 detection, HVF activation and boot. An initial System UI ANR dialog interrupted automation; a fixture waiting for actual login/home state passed after choosing Wait. The crash buffer was empty at the post-smoke observation. These checks do not verify all Android features, hardware, multitouch or long-term stability.

Android Release checks additionally passed app-owned file creation/read/copy/move, SQLite note retrieval after terminating and restarting the app, and native connected-network inspection. Biometric inspection reported fingerprint hardware support with no enrolled fingerprint; this validates capability discovery, not successful authentication. Document picking/download/sharing, real biometrics and other Android hardware flows still require separate validation.

Android Release TanStack checks passed real HTTP fetching of five todos, cache reads without additional requests, a simulated JSONPlaceholder mutation that invalidates the cache, and visible HTTP 404 handling. With the dedicated emulator disconnected, cached todos remained available and the fetch action rejected offline execution without increasing the request count. After restoring connectivity, an explicit refetch succeeded and cleared invalidation. This verifies the native online listener and these user-triggered flows; in-flight cancellation, automatic focus refetch and physical-device network transitions remain separate checks.

Bundled assets consumed by camera, gallery and WebView hooks resolve through the shared bundled-asset facade. Android drawable names are extracted to local files before reaching file-consuming native APIs. Native Android QR decoding passed after reproducing the resource-name failure. Video view registration is platform-specific: Android uses Expo Video TextureVideoView and iOS keeps VideoView. Android Release replay passed native rendering of the bundled six-second clip, pause/resume and mute after reproducing and correcting the missing-view-manager crash. Sources: [Expo Asset](https://docs.expo.dev/versions/latest/sdk/asset/), [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/).

The media hook supports playback and pause for a captured or selected video on the same screen. Permission continuations checkpoint lifecycle activity before camera activation, library writes and sharing. Camera/picker results use a navigation-only checkpoint so intentional native activity backgrounding is accepted, while results arriving after leaving the page are ignored. Regressions cover capture-to-player handoff, denial, late permission completion, native activity transitions, stale results and late library writes. Full checks passed with 128 tests across 29 files; these new media flows still require native capture regression.

Android Release capture regression passed photo capture/confirmation, preview and resize to 720 pixels, plus video capture/confirmation and return of a 720 × 1280 MP4. The emulator camera did not honor the requested 30-second duration limit. Captured-clip playback remains unverified: after recording, play/pause taps did not update the result, and navigating back exposed a native released-player pause exception. The video facade now makes pause safe after disposal and owns player suspension itself; the media hook no longer duplicates that cleanup. Replacing a selection hides the previous player until the new source is loaded. Full checks passed with 130 tests across 30 files; native replay of these final ownership fixes is pending.
