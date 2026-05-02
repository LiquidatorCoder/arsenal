## 0.1.1

- Drop `cached_network_image` dep — `ArAvatar` now uses Flutter's built-in `Image.network`. Makes the package WASM-compatible and removes a transitive plugin footprint.
- Add pub.dev `screenshots` carousel.
- README: switch image embeds to markdown syntax so they render on pub.dev.
- README: use absolute GitHub raw URLs for screenshots.

## 0.1.0+1

- README: use absolute GitHub raw URLs for screenshots so they render on pub.dev.

## 0.1.0

- Initial release of the Arsenal cyberpunk design system for Flutter.
- Components: AR app bar, avatar, bottom nav, bottom sheet, button, chip, progress steps, scaffold, tag.
- Theme, colors, spacing, typography (BigShouldersDisplay / Rajdhani / JetBrainsMono).
- Bundled fonts auto-registered via `package: 'arsenal'`.
- Example app demoing every component plus mission-control / operator-profile screens.
