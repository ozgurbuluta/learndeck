import 'package:flutter/material.dart';

/// Custom page route with a smooth fade + slide transition
class AppPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  AppPageRoute({required this.page})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: const Duration(milliseconds: 300),
          reverseTransitionDuration: const Duration(milliseconds: 250),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Fade transition
            final fadeAnimation = CurvedAnimation(
              parent: animation,
              curve: Curves.easeOut,
              reverseCurve: Curves.easeIn,
            );

            // Slide transition (subtle, from right)
            final slideAnimation = Tween<Offset>(
              begin: const Offset(0.05, 0),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
              reverseCurve: Curves.easeInCubic,
            ));

            return FadeTransition(
              opacity: fadeAnimation,
              child: SlideTransition(
                position: slideAnimation,
                child: child,
              ),
            );
          },
        );
}

/// Extension for easier navigation with custom transitions
extension NavigatorExtension on BuildContext {
  /// Navigate to a page with the app's custom transition
  Future<T?> pushScreen<T>(Widget page) {
    return Navigator.of(this).push<T>(AppPageRoute(page: page));
  }

  /// Replace current screen with custom transition
  Future<T?> pushReplacementScreen<T>(Widget page) {
    return Navigator.of(this).pushReplacement<T, void>(AppPageRoute(page: page));
  }

  /// Navigate to a page and remove all previous routes (clear stack)
  Future<T?> pushAndRemoveUntilScreen<T>(Widget page) {
    return Navigator.of(this).pushAndRemoveUntil<T>(
      AppPageRoute(page: page),
      (route) => false,
    );
  }
}

/// Animated icon that scales when selected
class AnimatedNavIcon extends StatelessWidget {
  final IconData icon;
  final bool isSelected;
  final Color selectedColor;
  final Color unselectedColor;
  final double size;

  const AnimatedNavIcon({
    super.key,
    required this.icon,
    required this.isSelected,
    required this.selectedColor,
    required this.unselectedColor,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 1.0, end: isSelected ? 1.15 : 1.0),
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOutBack,
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: Icon(
            icon,
            color: isSelected ? selectedColor : unselectedColor,
            size: size,
          ),
        );
      },
    );
  }
}
