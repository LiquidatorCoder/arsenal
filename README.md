# Arsenal

A cyberpunk-inspired Flutter design system. Components, theme, typography, and bundled display fonts in one drop-in package.

<p align="center">
  <img src="screenshots/gallery-top.png" alt="Gallery — typography and buttons" width="220" />
  <img src="screenshots/gallery-bottom.png" alt="Gallery — chips, avatar, progress, sheet" width="220" />
  <img src="screenshots/bottom-sheet.png" alt="Bottom sheet" width="220" />
</p>
<p align="center">
  <img src="screenshots/mission-control.png" alt="Mission Control example screen" width="330" />
  <img src="screenshots/operator-profile.png" alt="Operator Profile example screen" width="330" />
</p>

```yaml
dependencies:
  arsenal:
    path: ../arsenal   # or git: ... — pub.dev release pending
```

```dart
import 'package:arsenal/arsenal.dart';

MaterialApp(
  theme: arsenalTheme(),
  home: ArScaffold(
    appBar: ArAppBar(title: 'MISSION CONTROL'),
    body: ArButton(label: 'ENGAGE', onPressed: () {}),
  ),
);
```

## What's inside

- **Components:** `ArAppBar`, `ArAvatar`, `ArBottomNav`, `ArBottomSheet`, `ArButton`, `ArChip`, `ArProgressSteps`, `ArScaffold`, `ArTag`.
- **Tokens:** `ArsenalColors`, `ArsenalSpacing`, `ArsenalTypography`.
- **Theme:** `arsenalTheme()` returns a ready-to-use `ThemeData`.
- **Fonts (bundled):** BigShouldersDisplay, Rajdhani, JetBrainsMono.

## Example

A runnable demo app lives in [`example/`](./example):

```bash
cd example
flutter run
```

## License

BSD 3-Clause. See [LICENSE](./LICENSE).
