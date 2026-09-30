# App Starter Angular Native

Private Angular Native proof of concept based on [bhrenno2000/app-starter](https://github.com/bhrenno2000/app-starter). Angular components render native iOS and Android views through React Native Fabric, inside Expo. Angular Native is alpha; verify native integrations on devices before production use.

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

- Lazy-loaded Angular Router routes over native stacks, with awaited session guards.
- Login, protected home, logout and restoration of a mock session after restart.
- Signal Forms with email/password validation, loading/disabled/error states.
- Angular services and signals in place of React hooks, Zustand and React Query.
- Native HttpClient with HTTPS configuration, timeout, response validation and deduplicated token refresh on a 401 (one retry).
- Refresh tokens in device-only SecureStore; access tokens in memory; user metadata and theme preference in AES-256 encrypted MMKV.
- Persisted system/light/dark theme with the original starter's palette, Inter fonts and Portuguese UI.
- Button, Card, Form, FormScreenLayout, Header, Icon, Input, Skeleton and Typography primitives implemented as Angular components.
- Vitest component/service/router tests, strict template checking, ESLint, Prettier, CI and a Maestro smoke flow.

This is a port of the starter's main flows. The original standalone device-secret and biometric helper APIs are not included; the UI did not expose those flows. FlashList, HeroUI Native, Uniwind, Expo Router and React-specific form/state bindings are replaced by native Angular primitives. Skeleton is static; animation/performance/hardware security have not been validated by the Node tests.

## Structure

```text
src/
  app/        shell, providers and routes
  core/       HTTP, environment, storage and theme infrastructure
  modules/    auth and home features
  shared/     reusable components, models and utilities
  main.ts     native bootstrap
```

Use `@/*` for imports outside a feature and relative imports within it. Files use Angular's kebab-case naming. Screen implementations live inside feature modules.

## Verification

```sh
bun run check          # strict types/templates, lint, Vitest and formatting
bun run export         # production bundles for both platforms
maestro test .maestro/auth-smoke.yaml
```

The Maestro flow needs the installed development app and Metro running. Close the development-client menu before running. The test backend accepts any valid email/password shape. In mock mode the email is prefilled; enter a password of at least 6 characters (for example, `password`). Passwords are never prefilled.

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

Agent instructions and context files are local-only and ignored: `.claude/`, `.codex/`, `.agents/`, `AGENTS.md`, `CLAUDE.md`, `PRODUCT.md` and `DESIGN.md`. Angular, native, storage, testing, structure and Git rules are kept locally. No original React-specific skills are carried into the Angular version.

Best-practice sources researched on 2026-09-30: [Angular style guide](https://angular.dev/style-guide), [signals](https://angular.dev/guide/signals), [zoneless](https://angular.dev/guide/zoneless), [route guards](https://angular.dev/guide/routing/route-guards), [security](https://angular.dev/best-practices/security) and [Angular Native limitations](https://ng-native.com/guide/limitations).
