import 'package:arsenal/colors.dart';
import 'package:flutter/material.dart';

// ignore: avoid_classes_with_only_static_members
abstract final class ArsenalTypography {
  // ── Hero / Display ──────────────────────────────────────────────────────────

  /// 48px BigShouldersDisplay w800 UPPERCASE — Screen hero titles
  static const TextStyle hero = TextStyle(
    fontFamily: 'BigShouldersDisplay', package: 'arsenal',
    fontSize: 48,
    fontWeight: FontWeight.w800,
    letterSpacing: 2,
    color: ArsenalColors.onBackground,
  );

  /// 40px BigShouldersDisplay w800 UPPERCASE — Major section headers
  static const TextStyle displayLarge = TextStyle(
    fontFamily: 'BigShouldersDisplay', package: 'arsenal',
    fontSize: 40,
    fontWeight: FontWeight.w800,
    letterSpacing: 1.5,
    color: ArsenalColors.onBackground,
  );

  /// 32px BigShouldersDisplay w800 — Section headers
  static const TextStyle displayMedium = TextStyle(
    fontFamily: 'BigShouldersDisplay', package: 'arsenal',
    fontSize: 32,
    fontWeight: FontWeight.w800,
    color: ArsenalColors.onBackground,
  );

  // ── Subheadings ─────────────────────────────────────────────────────────────

  /// 24px Rajdhani w600 — Subheadings
  static const TextStyle subheadingLarge = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: ArsenalColors.onBackground,
  );

  /// 18px Rajdhani w600 — Card titles
  static const TextStyle subheadingMedium = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: ArsenalColors.onBackground,
  );

  // ── Body ────────────────────────────────────────────────────────────────────

  /// 16px Rajdhani w500 — Body copy
  static const TextStyle body = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 16,
    fontWeight: FontWeight.w500,
    color: ArsenalColors.onBackground,
  );

  /// 14px Rajdhani w500 — Secondary body
  static const TextStyle bodySmall = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: ArsenalColors.onBackground,
  );

  // ── Buttons / Labels ────────────────────────────────────────────────────────

  /// 14px Rajdhani w700 UPPERCASE — Button text
  static const TextStyle buttonLabel = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.2,
    color: ArsenalColors.onBackground,
  );

  /// 13px Rajdhani w700 — UI emphasis labels
  static const TextStyle labelEmphasis = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 13,
    fontWeight: FontWeight.w700,
    color: ArsenalColors.onBackground,
  );

  /// 12px Rajdhani w600 — Standard UI labels
  static const TextStyle label = TextStyle(
    fontFamily: 'Rajdhani', package: 'arsenal',
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: ArsenalColors.onBackground,
  );

  // ── Mono ─────────────────────────────────────────────────────────────────────

  /// 13px JetBrainsMono w700 UPPERCASE — Step counters, status, codes
  static const TextStyle monoHighlight = TextStyle(
    fontFamily: 'JetBrainsMono', package: 'arsenal',
    fontSize: 13,
    fontWeight: FontWeight.w700,
    letterSpacing: 1,
    color: ArsenalColors.onBackground,
  );

  /// 12px JetBrainsMono w400 — Timestamps, secondary technical text
  static const TextStyle mono = TextStyle(
    fontFamily: 'JetBrainsMono', package: 'arsenal',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: ArsenalColors.onBackground,
  );
}
