import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';
import '../../../models/dto/meal_response.dart';

/// UC-08 — Card hiển thị một bữa ăn trong danh sách.
class MealCard extends StatefulWidget {
  final MealResponse meal;
  final VoidCallback onComplete;

  const MealCard({
    super.key,
    required this.meal,
    required this.onComplete,
  });

  @override
  State<MealCard> createState() => _MealCardState();
}

class _MealCardState extends State<MealCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final meal = widget.meal;
    final isDone = meal.status.isDone;
    final isMissed = meal.status == PlanScheduleStatus.missed;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDone
              ? AppColors.success.withAlpha(80)
              : isMissed
                  ? AppColors.error.withAlpha(60)
                  : AppColors.borderLight,
          width: isDone ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.textPrimary.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Header Row ──────────────────────────────────────────────────
          InkWell(
            onTap: () => setState(() => _expanded = !_expanded),
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Icon + status indicator
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          color: isDone
                              ? AppColors.emerald100
                              : isMissed
                                  ? AppColors.red100
                                  : AppColors.green50,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.restaurant_rounded,
                          size: 24,
                          color: isDone
                              ? AppColors.success
                              : isMissed
                                  ? AppColors.error
                                  : AppColors.success,
                        ),
                      ),
                      if (isDone)
                        Container(
                          width: 16,
                          height: 16,
                          decoration: const BoxDecoration(
                            color: AppColors.success,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check, size: 10, color: AppColors.white),
                        ),
                    ],
                  ),
                  const SizedBox(width: 14),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                meal.mealName,
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: isDone
                                      ? AppColors.textSecondary
                                      : AppColors.textPrimary,
                                  decoration: isDone
                                      ? TextDecoration.lineThrough
                                      : null,
                                ),
                              ),
                            ),
                            _StatusChip(status: meal.status),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.schedule_rounded,
                              size: 13,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _formatTime(meal.scheduledAt),
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(width: 12),
                            if (meal.totalCalories > 0) ...[
                              Icon(
                                Icons.local_fire_department_rounded,
                                size: 13,
                                color: AppColors.orange,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                '${meal.totalCalories.toStringAsFixed(0)} kcal',
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.orange,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Expand arrow
                  AnimatedRotation(
                    turns: _expanded ? 0.5 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Expandable dishes list ───────────────────────────────────────
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: _DishesSection(
              meal: meal,
              onComplete: widget.onComplete,
            ),
            crossFadeState: _expanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 250),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

// ── Dishes Section ────────────────────────────────────────────────────────────

class _DishesSection extends StatelessWidget {
  final MealResponse meal;
  final VoidCallback onComplete;

  const _DishesSection({required this.meal, required this.onComplete});

  @override
  Widget build(BuildContext context) {
    final isDone = meal.status.isDone;

    return Column(
      children: [
        const Divider(height: 1, color: AppColors.borderLight),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Các món ăn',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                  letterSpacing: 0.3,
                ),
              ),
              const SizedBox(height: 8),
              ...meal.dishes.map(
                (dish) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          dish.displaySummary,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Complete button
        if (!isDone)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 14),
            child: SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onComplete,
                icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                label: const Text('Đánh dấu đã ăn'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.success,
                  side: const BorderSide(color: AppColors.success),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  textStyle: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle_rounded,
                    size: 16, color: AppColors.success),
                const SizedBox(width: 6),
                Text(
                  'Đã hoàn thành',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.success,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

// ── Status Chip ───────────────────────────────────────────────────────────────

class _StatusChip extends StatelessWidget {
  final PlanScheduleStatus status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case PlanScheduleStatus.completed:
        bg = AppColors.emerald100;
        fg = AppColors.teal600;
        label = 'Xong';
      case PlanScheduleStatus.missed:
        bg = AppColors.red100;
        fg = AppColors.error;
        label = 'Bỏ lỡ';
      case PlanScheduleStatus.notYet:
        bg = AppColors.green50;
        fg = AppColors.success;
        label = 'Chờ';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: fg,
        ),
      ),
    );
  }
}
