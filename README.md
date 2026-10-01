# App Starter Angular Native

A native iOS and Android showcase built with Angular Native, Angular and Expo, based on [bhrenno2000/app-starter](https://github.com/bhrenno2000/app-starter).

The application opens directly in the **Native showcase** catalogue without requiring sign-in. It contains 28 demonstrations, a searchable catalogue, native previews and explicit actions that expose their results. Login and the protected home screen remain separate features. Every screen uses the same fixed header with a back control and its page title; content scrolls below it.

## Why this project exists

The original starter uses React Native. This project explores how much of that native application model can be expressed with Angular: components, routing, forms, dependency injection, signals, native views, device APIs and commonly used mobile libraries.

It has three purposes:

1. **Demonstrate native capabilities through Angular.** Make camera capture, video playback, local storage, notifications, gestures and other integrations accessible through concrete screens rather than isolated snippets.
2. **Evaluate compatibility and engineering constraints.** Identify where Angular Native can reuse the React Native/Expo ecosystem, where an adapter is needed, and where a platform, hardware or signing requirement limits testing.
3. **Provide an organized starting point for experimentation.** Keep feature boundaries, reusable UI, provider composition and library abstractions consistent with the source starter.

The project attempts to show that Angular can drive a broad range of native mobile functionality using the same underlying ecosystem. It does **not** claim complete React Native feature parity, production readiness or verified behavior on every device. Angular Native is an early-stage dependency; successful compilation and mocked tests do not establish native correctness.

## How the application works

Angular components render native views through Angular Native's React Native Fabric integration. Expo supplies the native runtime and many device modules. The application does not render its Angular pages inside a browser or a WebView; the WebView category is a separate, explicit demonstration.

React and React Native remain runtime dependencies. Application pages and reusable components are authored in Angular rather than React JSX. React-specific bindings from the original starter are replaced with Angular-compatible rendering, forms and state adapters.

The original React starter uses Uniwind. This Angular version uses **`@ng-native/tailwind`** for native styling; it does not use Uniwind or NativeWind. Expo Router, HeroUI Native and FlashList are not used here. Navigation uses Angular Native's native stack, UI uses Angular components and lists use its `VirtualList` primitive.

## Technology stack

Versions below describe the declared dependencies. `bun.lock` is the source of truth for resolved versions.

| Layer                    | Libraries                                                                                                                  | Role                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Angular                  | `@angular/core`, `common`, `forms`, `router` — 22.2.1                                                                      | Components, signals, DI, Signal Forms and routing                          |
| Angular Native           | `@ng-native/components`, `device`, `expo`, `fabric`, `icons`, `metro`, `platform`, `router`, `testing`, `tailwind` — 0.2.0 | Native rendering, platform integration, routing, styling and test adapters |
| Native runtime           | Expo 57.0.26, React Native 0.86.3, React 19.2.3                                                                            | Native application host and module ecosystem                               |
| Server state             | `@tanstack/angular-query-experimental` — ^5.104.0                                                                          | Queries, cache inspection, invalidation and mutations                      |
| Local state              | `zustand` — ^5.0.15                                                                                                        | Vanilla stores connected to Angular signals                                |
| Persistent preferences   | `react-native-mmkv` — ^4.3.2; `react-native-nitro-modules` — ^0.36.5                                                       | Encrypted native key/value storage                                         |
| Gestures and motion      | Gesture Handler ~2.32.0, Reanimated 4.5.1, Worklets 0.10.1                                                                 | Native gesture recognition, UI-runtime transforms and thread handoff       |
| Bluetooth                | `react-native-ble-plx` — 3.5.1                                                                                             | Advertisement scanning, connections and GATT reads/notifications           |
| NFC                      | `react-native-nfc-manager` — 4.0.0-beta.9                                                                                  | Foreground NDEF tag sessions                                               |
| Embedded browser         | `react-native-webview` — 13.16.1                                                                                           | Native WebView and validated Angular message bridge                        |
| Native UI infrastructure | `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`                                               | Insets, native screen infrastructure and SVG/icon rendering                |
| Icons and fonts          | `@ng-icons/core`, `@ng-icons/lucide`, `@expo-google-fonts/inter`                                                           | Shared icon registry and Inter typography                                  |
| Contracts and utilities  | `zod`, `rxjs`, `buffer`                                                                                                    | Runtime validation, observable infrastructure and binary data helpers      |

### Development tools

TypeScript ~6.0.3 and `@angular/compiler-cli` compile/check Angular code and templates. Vitest ^5.0.0 and `@ng-native/testing` run unit/component/integration tests. ESLint ^9.39.5 with `typescript-eslint` enforces code boundaries, Prettier ^3.8.3 formats files, and Tailwind CSS/CLI ^4.3.3 compile native classes through the Angular Native preset. Babel and React type definitions support the native toolchain. Bun installs dependencies and runs the project scripts.

### Expo libraries

The showcase uses the following Expo modules behind hooks or application infrastructure:

| Area                                | Packages                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Camera and image processing         | `expo-camera`, `expo-image-picker`, `expo-image-manipulator`                                              |
| Media library and bundled resources | `expo-media-library`, `expo-asset`                                                                        |
| Video and audio                     | `expo-video`, `expo-video-thumbnails`, `expo-audio`                                                       |
| Documents, files, PDF and sharing   | `expo-document-picker`, `expo-file-system`, `expo-print`, `expo-sharing`                                  |
| Authentication and security         | `expo-local-authentication`, `expo-secure-store`, `expo-crypto`                                           |
| Database                            | `expo-sqlite`                                                                                             |
| Notifications                       | `expo-notifications`                                                                                      |
| Location and maps                   | `expo-location`, `expo-maps`                                                                              |
| Background execution                | `expo-background-task`, `expo-task-manager`                                                               |
| Contacts and calendar               | `expo-contacts`, `expo-calendar`                                                                          |
| Communication                       | `expo-mail-composer`, `expo-sms`, `expo-linking`, `expo-web-browser`                                      |
| Sensors and device information      | `expo-sensors`, `expo-device`, `expo-application`, `expo-battery`, `expo-brightness`, `expo-localization` |
| Device interaction                  | `expo-haptics`, `expo-clipboard`, `expo-speech`, `expo-screen-orientation`                                |
| Screen ownership and privacy        | `expo-keep-awake`, `expo-screen-capture`                                                                  |
| Application startup and appearance  | `expo-font`, `expo-splash-screen`, `expo-status-bar`, `expo-system-ui`                                    |
| Development runtime                 | `expo-dev-client`                                                                                         |

Connectivity combines `expo-network` with `@react-native-community/netinfo`. The libraries are integrated for specific demonstrations; their presence in the dependency list does not mean every API they expose has a screen or has been tested.

## What the showcase demonstrates

| Category / route suffix                     | Implemented behavior                                                                                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native lists — `lists`                      | Windowed native scrolling, generated samples, 20-item pagination up to 200, selection, filtering and screen-scoped favorites                        |
| Gestures & worklets — `interactions`        | Bounded pan/pinch transforms, tap, 650 ms long press, spring animation, reset and completed-gesture summaries                                       |
| Motion & layout — `layout-motion`           | Native-driver translation/opacity and experimental LayoutAnimation panel/row requests                                                               |
| Camera & barcodes — `camera`                | Native preview, camera facing, torch, live barcode events and decoding a bundled QR image                                                           |
| Camera & media — `media`                    | Photo/video capture, library selection, image preview, 720-pixel resize, save/share and captured-video playback/pause                               |
| Photo library management — `gallery`        | Paged metadata queries, album listing, owned sample album/images, image inspection and iOS demo-image favorites                                     |
| Video playback — `video`                    | Offline six-second sample clip, document selection, playback/pause/resume, seeking, sound toggle and progress                                       |
| Audio — `audio`                             | Microphone recording, stop, audio-file selection and native playback/pause                                                                          |
| Files & PDF — `files`                       | Document selection, app-owned files, read/write/list/copy/move, example download/preview, PDF generation and sharing                                |
| Biometrics & security — `security`          | Hardware/enrollment inspection, biometric authentication, random device-only demo secret and SHA-256 digest                                         |
| Notifications — `notifications`             | Local scheduling, pending/delivered inspection, owned cancellation/dismissal, receive/open history, badges and explicit push registration           |
| Location — `location`                       | Current coordinates and foreground location subscriptions                                                                                           |
| Background location — `background-location` | Explicit opt-in, foreground/background permissions, application-owned tracking, bounded callback metadata and stop/logout cleanup                   |
| Background tasks — `background`             | Scheduler registration, persistent execution journal, explicit unregister and separately labeled development/foreground previews                    |
| Motion & sensors — `sensors`                | Live accelerometer, gyroscope and magnetometer, explicit listener stop and today's step count                                                       |
| Device & system — `device`                  | Device/application/localization information, battery/power, brightness inspection, haptics, clipboard, speech, orientation, browser and settings    |
| Screen & lifecycle — `screen-controls`      | Keep-awake ownership, screenshot protection/events, app-switcher privacy and lifecycle inspection                                                   |
| Native maps — `maps`                        | Apple Maps or Google Maps, markers, camera controls and location                                                                                    |
| WebView — `web-view`                        | Bundled local document, controlled navigation, message validation and native-to-Angular communication                                               |
| Connectivity — `connectivity`               | Native network/reachability inspection and TanStack online state                                                                                    |
| SQLite — `database`                         | Parameterized SQL and persistent app-owned demonstration records                                                                                    |
| Contacts — `people`                         | Permission-aware queries and owned demo-contact creation, inspection, rename and restoration                                                        |
| Calendar & reminders — `calendar`           | Event queries, owned demo calendar/event, reversible updates, native event editor and iOS reminder operations                                       |
| Communication & links — `communication`     | Availability checks, recipient-free email/SMS drafts, native/external browser and validated app links                                               |
| Bluetooth BLE — `bluetooth`                 | Adapter inspection, bounded scanning, explicit peripheral/characteristic selection, connection, GATT discovery, reads, notifications and disconnect |
| NFC tags — `nfc`                            | Support inspection, foreground NDEF text/URI reading, bounded payload presentation and cancellation                                                 |
| TanStack Query — `query`                    | Real HTTP requests, typed cache, cache reads, refetch, invalidation, deliberate HTTP errors, simulated mutation and offline behavior                |
| Zustand & MMKV — `state`                    | Vanilla state connected to signals, encrypted preference persistence and counter restoration                                                        |

Actions display their actual result or a denied, cancelled, unsupported or configuration error. Scanned codes are not opened automatically. BLE characteristic writes, NFC writes/background tag handling, payment SDKs, analytics and error-reporting services are not implemented demonstrations.

The Query mutation uses JSONPlaceholder: its returned result demonstrates a mutation flow, not a durable server-side write. Virtual-list samples are generated locally rather than fetched from an API.

## Application architecture

```text
src/
  app/
    app.ts / app.html              Native application shell
    app.config.ts                 Application provider composition
    app.routes.ts                 Initial redirect, feature composition and fallback
  core/
    providers/<name>/             DI configuration and native context wrappers
    initializers/<name>/          Startup tasks and application-owned listeners
    hooks/<use-name>/             Shared lifecycle, links and background utilities
    api/<name>/                   Native HTTP adapters and interceptors
    storage/<name>/               SecureStore, encrypted MMKV and storage contracts
    theme/<name>/                 Theme preference and restoration
    testing/<name>/               Test adapters
  modules/
    auth/                         Login, session services and guards
    home/                         Protected home and theme controls
    showcase/                     Catalogue, demonstrations and native hook facades
  shared/
    components/<name>/            Reusable Angular native UI and view wrappers
    models/<name>/                Shared contracts
    utils/<name>/                 Focused utilities
  main.ts                         Native runtime entry point
  styles.css                      Semantic light/dark tokens and native Tailwind
assets/
  images/native/                  App icon, adaptive icon, splash and QR fixture
  media/                          Offline sample video
  html/                           Isolated WebView demonstration document
plugins/                          Native configuration helpers
```

### File and abstraction conventions

- Pages use `pages/<name>/page.ts` and `page.html`.
- Components use `components/<name>/index.ts` and `index.html`.
- Feature services use `services/<name>/service.ts`.
- Hooks, providers, initializers, core infrastructure and utilities use `<name>/index.ts`.
- Interfaces, named type aliases and domain unions belong in sibling `types.ts` files; primitive-only utilities do not need empty contract files.
- Tests live beside their implementation as `page.spec.ts`, `service.spec.ts` or `index.spec.ts`.
- Templates use `templateUrl`; native view-only wrappers may have an empty external template because their host is the rendered native view.
- `index.ts` represents one unit, not an aggregate export barrel.
- Use `@/*` across feature boundaries and relative imports inside the same feature.
- Code, UI, comments, documentation, validation messages and commits use English.

Pages and components consume hook facades. Direct third-party/native behavior belongs in hooks or core infrastructure; Angular and Angular Native rendering primitives are the consumer exceptions. ESLint enforces library boundaries and type-file separation.

### Providers and initializers

`core/providers/application` composes router, native HTTP, auth, storage, icons, Query, notifications and theme setup. Safe Area and the Gesture Handler root are native context wrappers under `core/providers`.

`core/initializers` owns native runtime/view registration, background callback definition, awaited font loading, splash dismissal after navigation/render, theme restoration, status-bar appearance, notification listeners and Query online/focus synchronization. `main.ts` invokes the runtime initializer; `app.config.ts` consumes the provider composition.

### Resource ownership

Screen-owned subscriptions, players, animations and foreground hardware use lifecycle hooks to suspend on navigation/background and release on destruction. Async activation checkpoints prevent late permission or SDK results from starting hidden work. Camera/document-picker continuations distinguish intentional external activity backgrounding from leaving the Angular screen.

Application-owned notification/Query listeners initialize centrally. Background schedules survive leaving their screen; unregistering is an explicit action. Background location is opt-in and stops on session invalidation/logout. Its journal persists bounded callback arrival metadata, while precise coordinates remain in memory.

## Storage and authentication

The default authentication backend is a local mock for demonstrating forms, guards and session restoration. Any valid email and a password of at least six characters are accepted in mock mode; the email is prefilled, the password is not. `password` is an example test password, not a production credential.

| Data                                                    | Storage                                        |
| ------------------------------------------------------- | ---------------------------------------------- |
| Access token                                            | Memory                                         |
| Refresh token and MMKV encryption key                   | Device-only SecureStore                        |
| User metadata, theme and persisted showcase preferences | AES-256 encrypted MMKV                         |
| Query cache                                             | Memory                                         |
| SQLite demonstrations and background callback journals  | App-owned SQLite databases                     |
| Captured/selected media and generated documents         | Native SDK cache or app-owned file directories |

The security demonstration reports whether its secret exists without displaying the secret value. Demo contact/image updates track ownership; permanent deletion of user contacts or photo-library data is not exposed.

The showcase is public. Home remains guarded. Route guards control navigation, not backend authorization. Biometrics in the security demonstration do not replace server authentication or authorize unrelated operations.

### Real API integration

Set `EXPO_PUBLIC_AUTH_MOCK=false` and configure an HTTPS `EXPO_PUBLIC_API_URL`. The adapter expects:

| Endpoint        | Purpose                                   |
| --------------- | ----------------------------------------- |
| `/auth/login`   | Issue access/refresh tokens and user data |
| `/auth/refresh` | Renew the session                         |
| `/users/me`     | Read the authenticated user               |
| `/auth/logout`  | End the server session                    |

Login/refresh responses contain `{ accessToken, refreshToken, expiresIn, user }`; payloads may be plain or wrapped in `{ data: payload }`. Logout accepts `null` or `{ data: null }`. User responses are checked against the project's schema. Adapt these contracts to your backend before disabling mock mode.

HTTP uses `provideNativeHttpClient()`, response validation, timeouts and deduplicated refresh after a 401 with one retry. Public environment values are embedded in the app and must not contain secrets.

## Getting started

### Requirements

- Node **22.23.2** (`nvm use`) and Bun **1.4.2**.
- Xcode and CocoaPods for iOS, or Android Studio and Android SDK for Android.
- A custom native build: Expo Go cannot load this project's MMKV/Nitro and other custom native integrations.
- A simulator/emulator for basic flows and physical hardware for camera, biometric, radio and OS-background validation.

### Install and run

```sh
bun install --frozen-lockfile
cp .env.example .env

# Generate/build the native app and open it.
bun run ios
# Or:
bun run android

# After installing a development client:
bun start
```

Select a specific iOS simulator or connected device when needed:

```sh
bun run ios --device "Angular Native Starter QA"
# With a connected physical iPhone:
bun run ios --device
```

Angular runs through the native Metro preset, not `ng serve`. This repository targets iOS/Android and does not provide a web build script.

Native libraries or config-plugin changes require regenerating/rebuilding the native client. JavaScript-only edits can be served through Metro in development. Metro disables lazy development bundle fragments by default (`EXPO_NO_METRO_LAZY=1`); feature route declarations still use `loadChildren` and `loadComponent`.

### Environment configuration

| Variable                     | Default / purpose                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_AUTH_MOCK`      | `true`; enables the local authentication backend                                           |
| `EXPO_PUBLIC_API_URL`        | `https://api.example.com`; replace for real authentication                                 |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Empty; required for the remote push registration demo                                      |
| `GOOGLE_MAPS_API_KEY`        | Empty; required for Google Maps on Android, restricted to the app package/signing identity |

The committed `.env.example` contains placeholders. `.env` and credentials remain ignored. Changing native map/push configuration requires rebuilding the client; entering an EAS project ID alone does not provision APNs/FCM.

### Signing and platform setup

The app scheme is `appstarterangular`; its iOS bundle ID and Android package are `com.bhrenno.appstarterangular`.

Physical iOS builds require a registered device, valid signing profile, Developer Mode and trust for the developer identity. NFC and push capabilities require a compatible Apple developer team/profile. The locally tested personal-team iPhone build omitted those two entitlements for installation; this is not a push/NFC validation and does not change the repository's intended native configuration.

Simulator builds used local ad hoc signing to preserve Keychain/SecureStore access. Do not clear app data or rotate encryption keys to work around signing failures. Android QA used a locally debug-signed Release APK, not a store distribution package.

Maps use Apple Maps on iOS and Google Maps on Android. Email requires a configured mail client; SMS requires a supported device/service. BLE needs nearby peripherals and NFC needs compatible hardware/tags. Background execution is scheduled by the OS and is not guaranteed by a foreground preview.

## Navigation and UI

`/` and unmatched routes redirect to `/showcase`. The catalogue and its `/showcase/:category` pages do not require login. Unknown category IDs redirect to the catalogue before loading a native feature.

Feature modules own their route lists in `modules/<feature>/routes/index.ts`. The application composes them under a shared componentless parent to preserve the native stack. Deep links build catalogue → demonstration ancestry.

For example:

```text
appstarterangular://showcase/communication
appstarterangular://showcase/query
```

The app-link facade validates known destinations and rejects unsupported schemes, unknown categories, query strings and fragments. HTTPS Universal Links/App Links are not configured; they require an owned domain and association files.

The shared `PageHeader` sits outside scrolling content. The catalogue root has a disabled back control because no preceding screen exists. Login/home headers return to the showcase. Theme controls remain in home, and the system/light/dark preference persists across restart. Inter fonts and semantic tokens preserve the source starter's palette.

## Validation and current evidence

```sh
bun run check
# Angular types/templates, ESLint, Vitest and Prettier

bun run export --max-workers 2
# Production bundles for iOS and Android
```

The latest full check passed **132 tests across 30 files**, together with strict template/type checks, lint and formatting. Both platform exports passed. Native builds and scoped simulator checks were also performed; the current signed build was installed/launched on an iPhone 15, and the updated bundle was opened in the Angular Native Starter QA simulator.

### What each validation layer establishes

| Layer                                          | Evidence and limits                                                                                                                                                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node/Vitest with fake Fabric and SDK stand-ins | Forms, bindings, routing, public startup, protected home, contracts, ownership, lifecycle cancellation and selected hook behavior; does not establish real hardware/rendering                                                           |
| iOS simulator native checks                    | Scoped maps/WebView/QR, storage, local notification interactions including cold opening, injected location callbacks, files/PDF sharing, owned gallery/contact actions, motion, gestures and lists; collected across incremental builds |
| Android emulator Release checks                | Login/restoration, lists, tap/pan, MMKV/SecureStore persistence, files, SQLite, connectivity, Query fetch/cache/error/offline/reconnect, QR decoding and sample-video playback                                                          |
| Android capture regression                     | Photo capture/confirmation and resize; a captured 720 × 1280 MP4 rendered with playback progress and explicit pause in an isolated replay                                                                                               |
| Physical iPhone                                | Current build installation and process launch confirmed; this alone does not establish complete feature validation                                                                                                                      |

These are scoped observations, not a claim that every feature was retested on the latest binary. The current UI/startup behavior also has integration test coverage. Earlier combined automation had missed button activations; isolated flows succeeded, so general touch-target reliability and long-term stability are not established by those runs.

### Known limits and remaining verification

- Real biometric authentication, live physical scanning, microphone/camera behavior on physical devices and many sensors still need hardware checks. Android biometric inspection found hardware but no enrollment.
- Physical BLE/GATT, actual NFC tags, NFC/push entitlements and remote push delivery need compatible hardware, provisioning and credentials.
- Automatic background task execution, physical background location and OS wake-up behavior remain separate from injected simulator callbacks and foreground previews.
- Actual multitouch pinch, layout-animation intermediate frames, frame performance and broader Android/device regressions remain incomplete.
- The external Android emulator camera ignored the requested recording duration limit in an earlier run; SDK options are not proof of enforcement.
- Query demos prove the tested request/cache flows; they do not establish production API authorization, durable JSONPlaceholder writes or every in-flight cancellation/focus-refetch scenario.
- Android media-library favorites and iOS-style reminders are not supported by the selected SDK APIs.
- Android maps require a configured key. Remote service demos do not fabricate success when configuration is missing.

## Native compatibility lessons

Two reproduced Android failures required platform adapters:

1. **Bundled assets:** native drawable resource names were not valid file URIs for camera/gallery consumers. `use-bundled-asset` materializes them before passing them to file-consuming SDKs.
2. **Video view registration:** Android uses Expo Video's `TextureVideoView`; iOS uses `VideoView`. Registering the iOS name on Android produced a missing-view-manager failure.

Player cleanup now tolerates late pause calls after disposal. New media selections hide the old video view until the replacement is loaded. Async native activity results are accepted after intentional backgrounding and rejected after page changes.

These adapters illustrate what the showcase is intended to uncover: ecosystem reuse is possible, but native view names, resource formats, lifetimes and platform requirements still need explicit integration and runtime verification.

## Customization and repository policy

Change application identifiers, assets and native plugins in `app.config.ts`; semantic colors/font tokens in `src/styles.css`; font loading in `core/initializers/fonts`; and API schemas/contracts in their feature/core units.

Styling uses `@ng-native/tailwind`, with no browser preflight or standalone style-generation wrapper. Metro generates `.angular-native` output. Generated `ios/`, `android/`, `.expo/`, `.angular-native/`, `dist/`, build output and `.env` are not committed.

Agent rules/context, screenshots, validation reports, temporary PR drafts and local automation fixtures remain outside the remote repository. GitHub Actions is disabled, and there are no committed GitHub workflow or Maestro files. Work is promoted through feature PRs into `develop`, then from `develop` into `main`.

## Documentation references

- [Original React Native starter](https://github.com/bhrenno2000/app-starter)
- [Angular Native getting started](https://ng-native.com/guide/getting-started) and [limitations](https://ng-native.com/guide/limitations)
- [Angular style guide](https://angular.dev/style-guide), [signals](https://angular.dev/guide/signals) and [security](https://angular.dev/best-practices/security)
- [Expo SDK reference](https://docs.expo.dev/versions/latest/) and [development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [TanStack Angular Query](https://tanstack.com/query/latest/docs/framework/angular/overview)
- [Zustand vanilla store](https://zustand.docs.pmnd.rs/apis/create-store)
- [React Native MMKV](https://github.com/mrousavy/react-native-mmkv)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/), [Reanimated](https://docs.swmansion.com/react-native-reanimated/) and [Worklets](https://docs.swmansion.com/react-native-worklets/)
- [React Native BLE PLX](https://dotintent.github.io/react-native-ble-plx/) and [React Native NFC Manager](https://github.com/revtel/react-native-nfc-manager)
- [React Native WebView](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md)

## License

MIT. See [LICENSE](LICENSE).
