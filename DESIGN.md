# Design authority

Port the existing app-starter identity. Operate mode: login, protected home and theme settings. Preserve Portuguese copy, blue brand palette, neutral light/dark surfaces and Inter. Do not introduce marketing copy or a new identity.

Semantic tokens live in src/styles.css; both themes define the same variables. Tailwind compiles through @ng-native/tailwind and uses class, not className. Components compose native primitives, with 48-point minimum press targets, roles/labels/states, safe-area insets, keyboard-aware login layout and readable validation feedback.

Login groups the welcome heading and two fields; its action stays in the footer above the keyboard. Home groups the user identity, theme choice and logout. NativeNavigation.reset removes the previous authentication screen. Node tests validate the view tree; simulator evidence is required for visual layout and keyboard behavior.
