# Validation — 2026-09-30

## Local checks

- `bun run check`: strict TypeScript/Angular template checking, ESLint and Prettier passed; 16 tests passed in 6 files.
- `bun run export`: Hermes production bundles for iOS and Android passed (4 Inter font assets).
- `npx expo prebuild --platform ios --no-install`: passed.
- Native debug build: Xcode 26.6, iOS 26.5 SDK, iPhone 17 Pro simulator; build succeeded with no compile errors. The build was run with 2 jobs to limit resource use.
- `maestro check-syntax .maestro/auth-smoke.yaml`: passed.
- Before the English-copy update, Maestro native smoke flow: 1/1 passed in 44 seconds. Verified required-password feedback, native password input, login, system/light/dark controls, session restoration after process restart, restored dark theme and logout. Screenshots reviewed for login, keyboard-adjusted login, light/dark home and restored home.

The English-copy update passed the local checks and both production exports. The Maestro flow assertions were translated; the simulator smoke test has not been rerun after this copy change.

The simulator exercised the actual SecureStore/MMKV adapters rather than the in-memory test adapter. This does not establish physical-device security, biometrics or hardware reliability.

## Repository checks

- Repository visibility confirmed private; default branch is develop.
- Agent instructions and context files are local-only and ignored. The initial AGENTS.md, PRODUCT.md and DESIGN.md files were subsequently removed from tracked files; earlier commits retain them. Detailed Angular rules remain local.
- The original app-starter correction was merged through PR #12, with typecheck and lint passed.

## CI limitation

GitHub Actions did not start jobs. The GitHub run page states that recent account payments failed or the spending limit needs to be increased. No billing settings were changed. Local checks and native smoke tests above were executed independently of GitHub Actions.

## Not verified

- Physical iOS device or Android emulator/device execution.
- A signed release binary or store deployment.
- Real backend authentication; native tests use the mock backend.
- The original starter's optional biometric/device-secret helper flows, which are not ported here.
