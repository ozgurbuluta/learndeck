import 'dart:math';
import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import '../theme/app_theme.dart';

/// A widget that displays confetti celebration effects
class CelebrationOverlay extends StatefulWidget {
  final Widget child;
  final bool celebrate;
  final VoidCallback? onCelebrationComplete;

  const CelebrationOverlay({
    super.key,
    required this.child,
    this.celebrate = false,
    this.onCelebrationComplete,
  });

  @override
  State<CelebrationOverlay> createState() => _CelebrationOverlayState();
}

class _CelebrationOverlayState extends State<CelebrationOverlay> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 2));
    if (widget.celebrate) {
      _confettiController.play();
    }
  }

  @override
  void didUpdateWidget(CelebrationOverlay oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.celebrate && !oldWidget.celebrate) {
      _confettiController.play();
    }
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        Align(
          alignment: Alignment.topCenter,
          child: ConfettiWidget(
            confettiController: _confettiController,
            blastDirection: pi / 2, // downward
            maxBlastForce: 5,
            minBlastForce: 2,
            emissionFrequency: 0.05,
            numberOfParticles: 20,
            gravity: 0.2,
            shouldLoop: false,
            colors: const [
              AppColors.primary,
              AppColors.accent,
              AppColors.coral,
              AppColors.teal,
              AppColors.pink,
              AppColors.cyan,
              AppColors.lime,
              AppColors.amber,
              AppColors.violet,
            ],
            createParticlePath: _drawStar,
          ),
        ),
      ],
    );
  }

  Path _drawStar(Size size) {
    // A simple star shape
    final random = Random();
    final useCircle = random.nextBool();

    if (useCircle) {
      return Path()
        ..addOval(Rect.fromCircle(center: Offset.zero, radius: size.width / 2));
    }

    // Star shape
    final path = Path();
    final centerX = size.width / 2;
    final centerY = size.height / 2;
    final outerRadius = size.width / 2;
    final innerRadius = size.width / 4;

    for (int i = 0; i < 5; i++) {
      final outerAngle = (i * 72 - 90) * pi / 180;
      final innerAngle = ((i * 72) + 36 - 90) * pi / 180;

      if (i == 0) {
        path.moveTo(
          centerX + outerRadius * cos(outerAngle),
          centerY + outerRadius * sin(outerAngle),
        );
      } else {
        path.lineTo(
          centerX + outerRadius * cos(outerAngle),
          centerY + outerRadius * sin(outerAngle),
        );
      }
      path.lineTo(
        centerX + innerRadius * cos(innerAngle),
        centerY + innerRadius * sin(innerAngle),
      );
    }
    path.close();
    return path;
  }
}

/// A simple confetti button that triggers celebration when tapped
class CelebrationButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;

  const CelebrationButton({
    super.key,
    required this.child,
    this.onPressed,
  });

  @override
  State<CelebrationButton> createState() => _CelebrationButtonState();
}

class _CelebrationButtonState extends State<CelebrationButton> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(duration: const Duration(seconds: 1));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  void _onTap() {
    _confettiController.play();
    widget.onPressed?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        GestureDetector(
          onTap: _onTap,
          child: widget.child,
        ),
        ConfettiWidget(
          confettiController: _confettiController,
          blastDirectionality: BlastDirectionality.explosive,
          maxBlastForce: 10,
          minBlastForce: 5,
          emissionFrequency: 0.1,
          numberOfParticles: 10,
          gravity: 0.3,
          shouldLoop: false,
          colors: const [
            AppColors.primary,
            AppColors.accent,
            AppColors.coral,
            AppColors.pink,
          ],
        ),
      ],
    );
  }
}
