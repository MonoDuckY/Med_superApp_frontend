import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';

/// 3-step progress indicator shown at the top of each booking screen.
class BookingStepper extends StatelessWidget {
  /// 1 = Time, 2 = Doctor, 3 = Payment
  final int currentStep;

  const BookingStepper({super.key, required this.currentStep});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _StepNode(step: 1, current: currentStep, label: 'Thời gian'),
        _StepConnector(done: currentStep > 1),
        _StepNode(step: 2, current: currentStep, label: 'Bác sĩ'),
        _StepConnector(done: currentStep > 2),
        _StepNode(step: 3, current: currentStep, label: 'Thanh toán'),
      ],
    );
  }
}

class _StepNode extends StatelessWidget {
  final int step;
  final int current;
  final String label;

  const _StepNode({
    required this.step,
    required this.current,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final isDone = step < current;
    final isActive = step == current;

    final bgColor = isDone
        ? AppColors.success
        : isActive
            ? AppColors.primary
            : Colors.white;
    final borderColor = isDone
        ? AppColors.success
        : isActive
            ? AppColors.primary
            : AppColors.slate300;
    final labelColor = isDone
        ? AppColors.success
        : isActive
            ? AppColors.primary
            : AppColors.textHint;

    return Column(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: bgColor,
            border: Border.all(color: borderColor, width: 1.5),
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, size: 14, color: Colors.white)
                : Text(
                    '$step',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : AppColors.textHint,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            color: labelColor,
          ),
        ),
      ],
    );
  }
}

class _StepConnector extends StatelessWidget {
  final bool done;

  const _StepConnector({required this.done});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        // Align connector with center of the 28px circles
        padding: const EdgeInsets.only(bottom: 20),
        child: Container(
          height: 2,
          color: done ? AppColors.success : AppColors.borderLight,
        ),
      ),
    );
  }
}
