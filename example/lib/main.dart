import 'package:arsenal/arsenal.dart';
import 'package:flutter/material.dart';

void main() => runApp(const ArsenalExampleApp());

class ArsenalExampleApp extends StatelessWidget {
  const ArsenalExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Arsenal',
      debugShowCheckedModeBanner: false,
      theme: arsenalDarkTheme,
      home: const _GalleryScreen(),
    );
  }
}

class _GalleryScreen extends StatefulWidget {
  const _GalleryScreen();

  @override
  State<_GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<_GalleryScreen> {
  int _navIndex = 0;
  bool _chipSelected = false;

  @override
  Widget build(BuildContext context) {
    return ArScaffold(
      appBar: const ArAppBar(title: 'ARSENAL', showBackButton: false),
      navBar: ArBottomNav(
        activeIndex: _navIndex,
        items: [
          ArNavItem(
            icon: Icons.dashboard,
            label: 'GALLERY',
            onTap: () => setState(() => _navIndex = 0),
          ),
          ArNavItem(
            icon: Icons.rocket_launch,
            label: 'MISSIONS',
            onTap: () {
              setState(() => _navIndex = 1);
              Navigator.of(context).push(
                MaterialPageRoute<void>(builder: (_) => const ArExampleMissionControl()),
              );
            },
          ),
          ArNavItem(
            icon: Icons.person,
            label: 'OPERATOR',
            onTap: () {
              setState(() => _navIndex = 2);
              Navigator.of(context).push(
                MaterialPageRoute<void>(builder: (_) => const ArExampleOperatorProfile()),
              );
            },
          ),
        ],
      ),
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const _Section(title: 'TYPOGRAPHY'),
          Text('HERO 48', style: ArsenalTypography.hero),
          Text('Display 32', style: ArsenalTypography.displayMedium),
          Text('Body — sharp, technical, dense.', style: ArsenalTypography.body),
          Text('STATUS · 02:14:33', style: ArsenalTypography.monoHighlight),

          const _Section(title: 'BUTTONS'),
          ArButton.primary(label: 'PRIMARY', onPressed: () {}),
          const SizedBox(height: ArsenalSpacing.sm),
          ArButton.secondary(label: 'SECONDARY', onPressed: () {}),
          const SizedBox(height: ArsenalSpacing.sm),
          ArButton.ghost(label: 'GHOST', onPressed: () {}),
          const SizedBox(height: ArsenalSpacing.sm),
          ArButton.primary(label: 'LOADING', onPressed: () {}, isLoading: true),
          const SizedBox(height: ArsenalSpacing.sm),
          ArButton.primary(label: 'DISABLED', isDisabled: true),

          const _Section(title: 'TAGS'),
          Wrap(
            spacing: ArsenalSpacing.sm,
            runSpacing: ArsenalSpacing.sm,
            children: const [
              ArTag(label: 'live'),
              ArTag(label: 'critical', color: ArsenalColors.error),
              ArTag(label: 'standby', color: ArsenalColors.muted),
            ],
          ),

          const _Section(title: 'CHIPS'),
          Row(
            children: [
              ArChip(
                label: 'TOGGLE',
                selected: _chipSelected,
                onTap: () => setState(() => _chipSelected = !_chipSelected),
              ),
              const SizedBox(width: ArsenalSpacing.sm),
              const ArChip(label: 'STATIC'),
            ],
          ),

          const _Section(title: 'AVATAR'),
          Row(
            children: const [
              ArAvatar(initials: 'AM', size: 56),
              SizedBox(width: ArsenalSpacing.md),
              ArAvatar(initials: 'OP'),
            ],
          ),

          const _Section(title: 'PROGRESS'),
          const ArProgressSteps(total: 5, current: 2),

          const _Section(title: 'BOTTOM SHEET'),
          ArButton.secondary(
            label: 'OPEN SHEET',
            onPressed: () => ArBottomSheet.show<void>(
              context,
              title: 'BRIEFING',
              child: Padding(
                padding: const EdgeInsets.all(ArsenalSpacing.md),
                child: Text(
                  'Operator briefing payload would render here.',
                  style: ArsenalTypography.body,
                ),
              ),
            ),
          ),

          const SizedBox(height: ArsenalSpacing.xl),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: ArsenalSpacing.lg, bottom: ArsenalSpacing.sm),
      child: Text(
        title,
        style: ArsenalTypography.labelEmphasis.copyWith(color: ArsenalColors.accent),
      ),
    );
  }
}
