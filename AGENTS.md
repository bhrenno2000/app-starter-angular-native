# App Starter Angular Native

Angular Native 0.2, Angular 22, Expo 57 and React Native 0.86. This is a native iOS/Android starter ported from bhrenno2000/app-starter. Preserve the core/modules/shared boundaries, Portuguese UI, Inter fonts, original palette, protected login/home flows and secure storage split.

- Node 22.23.2, Bun 1.4.2. Run `bun install --frozen-lockfile`, `bun run check` and `bun run export`.
- Use standalone Angular components, signals, computed, input/model/output and inject. Angular 22 defaults to OnPush; do not add redundant standalone/OnPush metadata or zone.js.
- Name files in kebab-case, tests `.spec.ts`, and keep screens inside their feature modules. Components are lowercase app-* selectors. Every native element must be imported and all visible text must be inside text.
- Use Signal Forms, native press/changeText events, native-stack-outlet and NativeNavigation.reset after login/logout.
- Use provideNativeHttpClient, never browser provideHttpClient by itself. No DOM, React components/hooks, Uniwind/HeroUI bindings, browser animations, SSR or hydration.
- Native CSS and Tailwind use @ng-native/tailwind, static classes and class bindings. Keep both theme variable sets aligned. Do not add Tailwind preflight.
- Refresh tokens and encryption keys belong in SecureStore; preferences and user metadata belong in encrypted MMKV; access tokens stay in memory. No credential/token logging. Route guards are UX; backend authorization remains necessary.
- Commits, branches and PRs use English conventional commits with no emojis or Co-Authored-By trailers. Work branches target develop. Stage explicit paths; no direct feature pushes to main/develop.
- `.claude/` is local only and must never be staged, committed or pushed. No credentials, .env, build output or generated native folders in Git.

Sources: https://angular.dev/style-guide, https://angular.dev/guide/signals, https://angular.dev/guide/zoneless, https://angular.dev/guide/routing/route-guards, https://ng-native.com/guide/limitations, https://ng-native.com/guide/forms.
