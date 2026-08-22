import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/l10n_extension.dart';

/// Main shell that wraps all authenticated screens with a Bottom Navigation Bar.
/// Uses go_router's ShellRoute — the [child] widget is the active tab's content.
class MainShell extends StatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  List<_TabItem> _getTabs(BuildContext context) => [
    _TabItem(
      label: context.l10n.home,
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      route: '/home',
    ),
    _TabItem(
      label: context.l10n.appointments,
      icon: Icons.calendar_month_outlined,
      activeIcon: Icons.calendar_month_rounded,
      route: '/schedule',
    ),
    _TabItem(
      label: context.l10n.health,
      icon: Icons.favorite_border_rounded,
      activeIcon: Icons.favorite_rounded,
      route: '/health',
    ),
    _TabItem(
      label: context.l10n.profile,
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      route: '/profile',
    ),
  ];

  int _getCurrentIndex(List<_TabItem> tabs) {
    final location = GoRouterState.of(context).uri.toString();
    for (int i = 0; i < tabs.length; i++) {
      if (location.startsWith(tabs[i].route)) return i;
    }
    return 0;
  }

  void _onTabTapped(List<_TabItem> tabs, int index) {
    final currentIndex = _getCurrentIndex(tabs);
    if (index == currentIndex) return;
    context.go(tabs[index].route);
  }

  @override
  Widget build(BuildContext context) {
    final tabs = _getTabs(context);
    final currentIndex = _getCurrentIndex(tabs);

    return Scaffold(
      body: widget.child,
      bottomNavigationBar: _BottomNav(
        selectedIndex: currentIndex,
        tabs: tabs,
        onTabTapped: (index) => _onTabTapped(tabs, index),
      ),
    );
  }
}

// ── Bottom Nav Bar ────────────────────────────────────────────────────────────

class _BottomNav extends StatelessWidget {
  final int selectedIndex;
  final List<_TabItem> tabs;
  final ValueChanged<int> onTabTapped;

  const _BottomNav({
    required this.selectedIndex,
    required this.tabs,
    required this.onTabTapped,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderLight, width: 1)),
        boxShadow: [
          BoxShadow(
            color: AppColors.blackAlpha10,
            blurRadius: 16,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(
              tabs.length,
              (i) => _NavItem(
                tab: tabs[i],
                isSelected: selectedIndex == i,
                onTap: () => onTabTapped(i),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Single Nav Item ───────────────────────────────────────────────────────────

class _NavItem extends StatelessWidget {
  final _TabItem tab;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.tab,
    required this.isSelected,
    required this.onTap,
  });

  /// Each tab has its own active color for visual personality
  Color _activeColor(String route) {
    switch (route) {
      case '/home':
        return AppColors.primary;
      case '/schedule':
        return AppColors.primary;
      case '/health':
        return AppColors.error; // red / heart
      case '/profile':
        return AppColors.purple;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _activeColor(tab.route);

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeInOut,
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: isSelected ? color.withAlpha(18) : Colors.transparent,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                isSelected ? tab.activeIcon : tab.icon,
                size: 22,
                color: isSelected ? color : AppColors.textHint,
              ),
            ),
            const SizedBox(height: 3),
            Text(
              tab.label,
              style: AppTypography.caption.copyWith(
                fontSize: 10,
                fontWeight:
                    isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? color : AppColors.textHint,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Data class ────────────────────────────────────────────────────────────────

class _TabItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String route;

  const _TabItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.route,
  });
}
