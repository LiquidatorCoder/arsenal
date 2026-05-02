import 'package:arsenal/colors.dart';
import 'package:flutter/material.dart';

@immutable
class ArsenalTheme extends ThemeExtension<ArsenalTheme> {
  const ArsenalTheme();

  static ArsenalTheme of(BuildContext context) {
    return Theme.of(context).extension<ArsenalTheme>()!;
  }

  @override
  ArsenalTheme copyWith() => const ArsenalTheme();

  @override
  ArsenalTheme lerp(ThemeExtension<ArsenalTheme>? other, double t) {
    return const ArsenalTheme();
  }
}

final ThemeData arsenalDarkTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: ArsenalColors.background,
  colorScheme: const ColorScheme.dark(
    primary: ArsenalColors.accent,
    secondary: ArsenalColors.accent,
    surface: ArsenalColors.surface,
    error: ArsenalColors.error,
    onPrimary: Colors.white,
    onSecondary: Colors.white,
    onSurface: ArsenalColors.onSurface,
    onError: Colors.white,
  ),
  textTheme: ThemeData.dark().textTheme.apply(fontFamily: 'packages/arsenal/Rajdhani'),
  extensions: const [ArsenalTheme()],
);
