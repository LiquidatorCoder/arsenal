<h1 align="center">Arsenal ⚡</h1>

<p align="center">A cyberpunk-inspired Flutter design system. 🌃</p>

<p align="center">
  Components, theme, typography, and bundled display fonts — all wired up in one
  drop-in package so you can ship sharp-cornered, neon-accent UI without
  rolling your own tokens, fonts, or scaffolding.
</p>

<p align="center">
  <a href="https://pub.dev/packages/arsenal"><img src="https://img.shields.io/pub/v/arsenal.svg?label=pub&color=blue" alt="pub version" /></a>
  <a href="https://flutter.dev"><img src="https://img.shields.io/badge/Platform-Flutter-blue.svg?logo=flutter" alt="Platform Flutter" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-BSD--3-orange.svg" alt="License BSD-3" /></a>
</p>

![Gallery — typography and buttons](https://raw.githubusercontent.com/LiquidatorCoder/arsenal/main/screenshots/gallery-top.png)
![Gallery — chips, avatar, progress, sheet](https://raw.githubusercontent.com/LiquidatorCoder/arsenal/main/screenshots/gallery-bottom.png)
![Bottom sheet](https://raw.githubusercontent.com/LiquidatorCoder/arsenal/main/screenshots/bottom-sheet.png)

![Mission Control example screen](https://raw.githubusercontent.com/LiquidatorCoder/arsenal/main/screenshots/mission-control.png)
![Operator Profile example screen](https://raw.githubusercontent.com/LiquidatorCoder/arsenal/main/screenshots/operator-profile.png)

```yaml
dependencies:
  arsenal: ^0.1.0
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

## 📦 What's inside

- 🧩 **Components:** `ArAppBar`, `ArAvatar`, `ArBottomNav`, `ArBottomSheet`, `ArButton`, `ArChip`, `ArProgressSteps`, `ArScaffold`, `ArTag`.
- 🎨 **Tokens:** `ArsenalColors`, `ArsenalSpacing`, `ArsenalTypography`.
- 🌒 **Theme:** `arsenalTheme()` returns a ready-to-use `ThemeData`.
- 🔤 **Fonts (bundled):** BigShouldersDisplay, Rajdhani, JetBrainsMono.

## 🚀 Example

A runnable demo app lives in [`example/`](./example):

```bash
cd example
flutter run
```

## 📄 License

BSD 3-Clause. See [LICENSE](./LICENSE).
