import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/app_colors.dart';
import '../../models/dto/meal_response.dart';
import '../../models/dto/workout_response.dart';
import '../../view_models/daily_activities_viewmodel.dart';
import 'widgets/meal_card.dart';
import 'widgets/workout_card.dart';
import 'widgets/add_meal_bottom_sheet.dart';
import 'widgets/add_workout_bottom_sheet.dart';

/// UC-08 — Màn hình Theo dõi Hoạt động Sức khỏe Hàng ngày.
///
/// Hiển thị 2 tab: Dinh dưỡng (bữa ăn + calo) và Luyện tập (bài tập).
/// Cho phép lọc theo ngày (hôm nay + 2 ngày trước — BR-02).
class DailyActivitiesView extends StatelessWidget {
  const DailyActivitiesView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => DailyActivitiesViewModel(),
      child: const _DailyActivitiesContent(),
    );
  }
}

class _DailyActivitiesContent extends StatefulWidget {
  const _DailyActivitiesContent();

  @override
  State<_DailyActivitiesContent> createState() =>
      _DailyActivitiesContentState();
}

class _DailyActivitiesContentState extends State<_DailyActivitiesContent>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Consumer<DailyActivitiesViewModel>(
          builder: (context, vm, _) {
            return Column(
              children: [
                // ── Header ─────────────────────────────────────────────────
                _ActivityHeader(onRefresh: vm.refresh),

                // ── Date Picker Row ────────────────────────────────────────
                _DatePickerRow(
                  dates: vm.allowedDates,
                  selectedDate: vm.selectedDate,
                  onSelectDate: vm.selectDate,
                ),

                // ── Summary Banner ─────────────────────────────────────────
                _SummaryBanner(
                  totalCalories: vm.totalCaloriesForSelectedDate,
                  mealCount: vm.mealsForSelectedDate.length,
                  workoutCount: vm.workoutsForSelectedDate.length,
                  completedWorkouts: vm.completedWorkoutsForSelectedDate,
                ),

                // ── Tab Bar ────────────────────────────────────────────────
                _ActivityTabBar(controller: _tabController),

                // ── Content ────────────────────────────────────────────────
                Expanded(
                  child: vm.isLoading
                      ? const _LoadingState()
                      : vm.errorMessage != null
                          ? _ErrorState(
                              message: vm.errorMessage!,
                              onRetry: vm.refresh,
                            )
                          : TabBarView(
                              controller: _tabController,
                              children: [
                                // Tab 1 — Dinh dưỡng
                                _NutritionTab(
                                  meals: vm.mealsForSelectedDate,
                                  selectedDate: vm.selectedDate,
                                  onComplete: vm.completeMeal,
                                  onAdd: ({
                                    required mealName,
                                    required scheduledAt,
                                    required dishes,
                                    note,
                                  }) =>
                                      vm.addMeal(
                                    mealName: mealName,
                                    scheduledAt: scheduledAt,
                                    dishes: dishes,
                                    note: note,
                                  ),
                                ),

                                // Tab 2 — Luyện tập
                                _WorkoutTab(
                                  workouts: vm.workoutsForSelectedDate,
                                  selectedDate: vm.selectedDate,
                                  onComplete: vm.completeWorkout,
                                  onAdd: ({
                                    required workoutName,
                                    required scheduledAt,
                                    content,
                                    note,
                                  }) =>
                                      vm.addWorkout(
                                    workoutName: workoutName,
                                    scheduledAt: scheduledAt,
                                    content: content,
                                    note: note,
                                  ),
                                ),
                              ],
                            ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── Header ─────────────────────────────────────────────────────────────────────

class _ActivityHeader extends StatelessWidget {
  final VoidCallback onRefresh;

  const _ActivityHeader({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.white,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 8, 12),
            child: Row(
              children: [
                IconButton(
                  onPressed: () {
                    if (context.canPop()) {
                      context.pop();
                    } else {
                      context.go('/health');
                    }
                  },
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                  color: AppColors.textPrimary,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chăm sóc bản thân',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        'Theo dõi hàng ngày',
                        style: GoogleFonts.inter(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                // Refresh icon
                IconButton(
                  onPressed: onRefresh,
                  icon: const Icon(Icons.refresh_rounded, size: 22),
                  color: AppColors.textSecondary,
                  tooltip: 'Làm mới',
                ),
                // Header icon
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: AppColors.successGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.monitor_heart_rounded,
                      color: AppColors.white, size: 22),
                ),
                const SizedBox(width: 8),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),
        ],
      ),
    );
  }
}

// ── Date Picker Row ────────────────────────────────────────────────────────────

class _DatePickerRow extends StatelessWidget {
  final List<DateTime> dates;
  final DateTime selectedDate;
  final ValueChanged<DateTime> onSelectDate;

  const _DatePickerRow({
    required this.dates,
    required this.selectedDate,
    required this.onSelectDate,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.white,
      padding: const EdgeInsets.only(top: 8, bottom: 14),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Row(
          children: [
            ...dates.asMap().entries.map((entry) {
              final date = entry.value;
              final isSelected = _isSameDay(date, selectedDate);
              final isToday = _isSameDay(date, DateTime.now());

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: SizedBox(
                  width: 96,
                  child: _DateChip(
                    date: date,
                    isSelected: isSelected,
                    isToday: isToday,
                    onTap: () => onSelectDate(date),
                  ),
                ),
              );
            }),
            Container(
              width: 54,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.canvasColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: IconButton(
                icon: const Icon(Icons.calendar_month_rounded, color: AppColors.textSecondary),
                onPressed: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: selectedDate,
                    firstDate: DateTime.now().subtract(const Duration(days: 2)),
                    lastDate: DateTime.now(),
                    builder: (context, child) {
                      return Theme(
                        data: Theme.of(context).copyWith(
                          colorScheme: const ColorScheme.light(
                            primary: AppColors.success,
                            onPrimary: AppColors.white,
                            onSurface: AppColors.textPrimary,
                          ),
                        ),
                        child: child!,
                      );
                    },
                  );
                  if (picked != null) {
                    onSelectDate(picked);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  static bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}

class _DateChip extends StatelessWidget {
  final DateTime date;
  final bool isSelected;
  final bool isToday;
  final VoidCallback onTap;

  const _DateChip({
    required this.date,
    required this.isSelected,
    required this.isToday,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final label = isToday
        ? 'Hôm nay'
        : DateFormat('dd/MM', 'vi').format(date);
    final weekday = DateFormat('EEE', 'vi').format(date);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected ? AppColors.successGradient : null,
          color: isSelected ? null : AppColors.canvasColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.success : AppColors.borderLight,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.success.withAlpha(50),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(
              weekday,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: isSelected
                    ? AppColors.white.withAlpha(200)
                    : AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: isSelected ? AppColors.white : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Summary Banner ─────────────────────────────────────────────────────────────

class _SummaryBanner extends StatelessWidget {
  final double totalCalories;
  final int mealCount;
  final int workoutCount;
  final int completedWorkouts;

  const _SummaryBanner({
    required this.totalCalories,
    required this.mealCount,
    required this.workoutCount,
    required this.completedWorkouts,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: AppColors.tealGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withAlpha(50),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Calories stat
            Expanded(
              child: _BannerStat(
                icon: Icons.local_fire_department_rounded,
                value: totalCalories > 0
                    ? totalCalories.toStringAsFixed(0)
                    : '--',
                unit: 'kcal',
                label: 'Tổng calo',
              ),
            ),
            _BannerDivider(),
            // Meals stat
            Expanded(
              child: _BannerStat(
                icon: Icons.restaurant_rounded,
                value: '$mealCount',
                unit: 'bữa',
                label: 'Dinh dưỡng',
              ),
            ),
            _BannerDivider(),
            // Workout stat
            Expanded(
              child: _BannerStat(
                icon: Icons.fitness_center_rounded,
                value: '$completedWorkouts/$workoutCount',
                unit: 'xong',
                label: 'Luyện tập',
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BannerStat extends StatelessWidget {
  final IconData icon;
  final String value;
  final String unit;
  final String label;

  const _BannerStat({
    required this.icon,
    required this.value,
    required this.unit,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 18, color: AppColors.white.withAlpha(220)),
        const SizedBox(height: 4),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: value,
                style: GoogleFonts.inter(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.white,
                ),
              ),
              TextSpan(
                text: ' $unit',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AppColors.white.withAlpha(200),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            color: AppColors.white.withAlpha(180),
          ),
        ),
      ],
    );
  }
}

class _BannerDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      width: 1,
      color: AppColors.white.withAlpha(60),
      margin: const EdgeInsets.symmetric(horizontal: 8),
    );
  }
}

// ── Tab Bar ────────────────────────────────────────────────────────────────────

class _ActivityTabBar extends StatelessWidget {
  final TabController controller;

  const _ActivityTabBar({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.white,
      margin: const EdgeInsets.only(top: 14),
      child: TabBar(
        controller: controller,
        indicatorColor: AppColors.success,
        indicatorWeight: 2.5,
        labelColor: AppColors.success,
        unselectedLabelColor: AppColors.textSecondary,
        labelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        tabs: const [
          Tab(
            icon: Icon(Icons.restaurant_rounded, size: 18),
            text: 'Dinh dưỡng',
            iconMargin: EdgeInsets.only(bottom: 2),
          ),
          Tab(
            icon: Icon(Icons.fitness_center_rounded, size: 18),
            text: 'Luyện tập',
            iconMargin: EdgeInsets.only(bottom: 2),
          ),
        ],
      ),
    );
  }
}

// ── Nutrition Tab ──────────────────────────────────────────────────────────────

class _NutritionTab extends StatelessWidget {
  final List<MealResponse> meals;
  final DateTime selectedDate;
  final Future<String?> Function(String) onComplete;
  final Function({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  }) onAdd;

  const _NutritionTab({
    required this.meals,
    required this.selectedDate,
    required this.onComplete,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final minDate = today.subtract(const Duration(days: 2));
    final curDate = DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
    final isEditable = !curDate.isAfter(today) && !curDate.isBefore(minDate);

    return Stack(
      children: [
        meals.isEmpty
            ? _EmptyState(
                icon: Icons.no_food_rounded,
                title: 'Chưa có bữa ăn nào',
                subtitle: 'Ghi lại bữa ăn của bạn để theo dõi dinh dưỡng',
                accentColor: AppColors.success,
              )
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                itemCount: meals.length,
                itemBuilder: (context, i) => MealCard(
                  meal: meals[i],
                  isEditable: isEditable,
                  onComplete: () => _handleComplete(context, meals[i].id),
                ),
              ),

        // FAB
        if (isEditable)
          Positioned(
            right: 16,
            bottom: 20,
            child: _AddFab(
              label: 'Thêm bữa ăn',
              color: AppColors.success,
              icon: Icons.add_rounded,
              onTap: () => _openAddMeal(context),
            ),
          ),
      ],
    );
  }

  Future<void> _handleComplete(BuildContext context, String mealId) async {
    final error = await onComplete(mealId);
    if (error != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _openAddMeal(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.transparent,
      builder: (_) => AddMealBottomSheet(
        forDate: selectedDate,
        onSubmit: ({
          required mealName,
          required scheduledAt,
          required dishes,
          note,
        }) async {
          final error = await onAdd(
            mealName: mealName,
            scheduledAt: scheduledAt,
            dishes: dishes,
            note: note,
          );
          if (error != null && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(error),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
      ),
    );
  }
}

// ── Workout Tab ────────────────────────────────────────────────────────────────

class _WorkoutTab extends StatelessWidget {
  final List<WorkoutResponse> workouts;
  final DateTime selectedDate;
  final Future<String?> Function(String) onComplete;
  final Function({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) onAdd;

  const _WorkoutTab({
    required this.workouts,
    required this.selectedDate,
    required this.onComplete,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final minDate = today.subtract(const Duration(days: 2));
    final curDate = DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
    final isEditable = !curDate.isAfter(today) && !curDate.isBefore(minDate);

    return Stack(
      children: [
        workouts.isEmpty
            ? _EmptyState(
                icon: Icons.directions_run_rounded,
                title: 'Chưa có bài tập nào',
                subtitle:
                    'Thêm bài tập để duy trì lối sống năng động mỗi ngày',
                accentColor: AppColors.orange,
              )
            : ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                itemCount: workouts.length,
                itemBuilder: (context, i) => WorkoutCard(
                  workout: workouts[i],
                  isEditable: isEditable,
                  onComplete: () => _handleComplete(context, workouts[i].id),
                ),
              ),

        // FAB
        if (isEditable)
          Positioned(
            right: 16,
            bottom: 20,
            child: _AddFab(
              label: 'Thêm bài tập',
              color: AppColors.orange,
              icon: Icons.add_rounded,
              onTap: () => _openAddWorkout(context),
            ),
          ),
      ],
    );
  }

  Future<void> _handleComplete(BuildContext context, String workoutId) async {
    final error = await onComplete(workoutId);
    if (error != null && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _openAddWorkout(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.transparent,
      builder: (_) => AddWorkoutBottomSheet(
        forDate: selectedDate,
        onSubmit: ({
          required workoutName,
          required scheduledAt,
          content,
          note,
        }) async {
          final error = await onAdd(
            workoutName: workoutName,
            scheduledAt: scheduledAt,
            content: content,
            note: note,
          );
          if (error != null && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(error),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
      ),
    );
  }
}

// ── FAB ───────────────────────────────────────────────────────────────────────

class _AddFab extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;
  final VoidCallback onTap;

  const _AddFab({
    required this.label,
    required this.color,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: color.withAlpha(90),
              blurRadius: 14,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: AppColors.white, size: 20),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty State ────────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color accentColor;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: accentColor.withAlpha(20),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 36, color: accentColor.withAlpha(180)),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Loading State ──────────────────────────────────────────────────────────────

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(
        color: AppColors.success,
        strokeWidth: 2.5,
      ),
    );
  }
}

// ── Error State ────────────────────────────────────────────────────────────────

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded,
                size: 48, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Thử lại'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
