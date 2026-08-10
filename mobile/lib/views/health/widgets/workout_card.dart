import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';
import '../../../models/dto/meal_response.dart';
import '../../../models/dto/workout_response.dart';

/// UC-08 — Card hiển thị một bài tập thể dục.
class WorkoutCard extends StatelessWidget {
  final WorkoutResponse workout;
  final VoidCallback onComplete;

  const WorkoutCard({
    super.key,
    required this.workout,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    final isDone = workout.status.isDone;
    final isMissed = workout.status == PlanScheduleStatus.missed;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDone
              ? AppColors.orange.withAlpha(80)
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
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ────────────────────────────────────────────────────
            Row(
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: isDone
                            ? AppColors.orange200.withAlpha(100)
                            : isMissed
                                ? AppColors.red100
                                : AppColors.orange50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.fitness_center_rounded,
                        size: 24,
                        color: isDone
                            ? AppColors.amber600
                            : isMissed
                                ? AppColors.error
                                : AppColors.orange,
                      ),
                    ),
                    if (isDone)
                      Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: AppColors.amber600,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check, size: 10, color: AppColors.white),
                      ),
                  ],
                ),
                const SizedBox(width: 14),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              workout.workoutName,
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
                          _WorkoutStatusChip(status: workout.status),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.schedule_rounded,
                              size: 13, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            _formatTime(workout.scheduledAt),
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // ── Content ───────────────────────────────────────────────────
            if (workout.content != null && workout.content!.isNotEmpty) ...[
              const SizedBox(height: 10),
              const Divider(height: 1, color: AppColors.borderLight),
              const SizedBox(height: 10),
              Text(
                workout.content!,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            // ── Note ──────────────────────────────────────────────────────
            if (workout.note != null && workout.note!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.sticky_note_2_outlined,
                      size: 13, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      workout.note!,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textHint,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // ── Action ────────────────────────────────────────────────────
            const SizedBox(height: 12),
            if (!isDone)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onComplete,
                  icon: const Icon(Icons.check_circle_outline_rounded, size: 18),
                  label: const Text('Đánh dấu hoàn thành'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.orange,
                    side: const BorderSide(color: AppColors.orange),
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
              )
            else
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_rounded,
                      size: 16, color: AppColors.amber600),
                  const SizedBox(width: 6),
                  Text(
                    'Đã hoàn thành',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.amber600,
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }
}

class _WorkoutStatusChip extends StatelessWidget {
  final PlanScheduleStatus status;

  const _WorkoutStatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case PlanScheduleStatus.completed:
        bg = AppColors.amber100;
        fg = AppColors.amber600;
        label = 'Xong';
      case PlanScheduleStatus.missed:
        bg = AppColors.red100;
        fg = AppColors.error;
        label = 'Bỏ lỡ';
      case PlanScheduleStatus.notYet:
        bg = AppColors.orange50;
        fg = AppColors.orange;
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
