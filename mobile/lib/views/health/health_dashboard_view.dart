import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/app_colors.dart';
import '../../models/dto/medicine_schedule_response.dart';
import '../../view_models/medicine_schedule_viewmodel.dart';
import '../../view_models/daily_activities_viewmodel.dart';
import '../../view_models/health_news_viewmodel.dart';

/// Tab 3 — Sức khỏe (Health Hub)
/// Dashboard tổng hợp cho UC-08 (Daily Activities), UC-10 (Care Plan), UC-11 (Medicine Schedule).
class HealthDashboardView extends StatelessWidget {
  const HealthDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => MedicineScheduleViewModel()),
        ChangeNotifierProvider(create: (_) => DailyActivitiesViewModel()),
        ChangeNotifierProvider(create: (_) => HealthNewsViewModel()..loadNews()),
      ],
      child: const _HealthScaffold(),
    );
  }
}

// ── Scaffold ──────────────────────────────────────────────────────────────────

class _HealthScaffold extends StatelessWidget {
  const _HealthScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ───────────────────────────────────────────────────────
            _HealthHeader(),

            // ── Content ──────────────────────────────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Hero: Tổng quan hôm nay ──────────────────────────────
                    _DailyOverviewHeroCard(),
                    const SizedBox(height: 20),

                    // ── Section: Theo dõi hàng ngày ──────────────────────────
                    _SectionHeader(label: 'Theo dõi hàng ngày'),
                    const SizedBox(height: 10),

                    // UC-11: Lịch uống thuốc
                    _MedicineScheduleCard(),
                    const SizedBox(height: 12),

                    // UC-08: Theo dõi hoạt động sức khỏe (Bữa ăn & Luyện tập)
                    _DailyActivityCard(),
                    const SizedBox(height: 20),

                    // ── Section: Kiến thức & Tin tức sức khỏe ────────────────
                    _SectionHeader(label: 'Kiến thức & Tin tức sức khỏe'),
                    const SizedBox(height: 10),

                    // UC-12: Kiến thức & Tin tức sức khỏe
                    _HealthNewsCard(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _HealthHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Sức khỏe & Lối sống',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Sức khỏe',
                        style: GoogleFonts.inter(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: AppColors.tealGradient,
                    borderRadius: BorderRadius.circular(13),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.teal.withAlpha(50),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.favorite_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),
        ],
      ),
    );
  }
}

// ── Section Header ────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  const _SectionHeader({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        color: AppColors.textHint,
        letterSpacing: 0.8,
      ),
    );
  }
}

// ── 1. Hero Card: Tổng quan sức khỏe hôm nay ──────────────────────────────────

class _DailyOverviewHeroCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final medVm = context.watch<MedicineScheduleViewModel>();
    final actVm = context.watch<DailyActivitiesViewModel>();

    final now = DateTime.now();
    final dateStr = DateFormat('EEEE, dd/MM/yyyy', 'vi_VN').format(now);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0369A1), Color(0xFF0EA5E9), Color(0xFF06B6D4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(70),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Date Badge & Health Status
          Row(
            children: [
              Flexible(
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(35),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withAlpha(60)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.today_rounded,
                          size: 12, color: Colors.white),
                      const SizedBox(width: 5),
                      Flexible(
                        child: Text(
                          dateStr,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(50),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.success.withAlpha(120)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.check_circle_outline_rounded,
                        size: 12, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      'Tốt',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Main Title
          Text(
            'Kế hoạch chăm sóc hôm nay',
            style: GoogleFonts.inter(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            'Duy trì thói quen uống thuốc và dinh dưỡng khoa học',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: Colors.white.withAlpha(210),
            ),
          ),
          const SizedBox(height: 16),

          // 3 Mini Stat Rings / Cards
          Row(
            children: [
              Expanded(
                child: _HeroStatItem(
                  icon: Icons.medication_rounded,
                  title: 'Uống thuốc',
                  value: medVm.isLoading
                      ? '...'
                      : '${medVm.todayTaken}/${medVm.todayTotal}',
                  unit: 'liều',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _HeroStatItem(
                  icon: Icons.restaurant_rounded,
                  title: 'Dinh dưỡng',
                  value: actVm.isLoading
                      ? '...'
                      : '${actVm.totalCaloriesForSelectedDate.toInt()}',
                  unit: 'kcal',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _HeroStatItem(
                  icon: Icons.fitness_center_rounded,
                  title: 'Luyện tập',
                  value: actVm.isLoading
                      ? '...'
                      : '${actVm.completedWorkoutsForSelectedDate}/${actVm.workoutsForSelectedDate.length}',
                  unit: 'bài tập',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroStatItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String unit;

  const _HeroStatItem({
    required this.icon,
    required this.title,
    required this.value,
    required this.unit,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(25),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withAlpha(50)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 13, color: Colors.white.withAlpha(220)),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withAlpha(200),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          RichText(
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            text: TextSpan(
              children: [
                TextSpan(
                  text: value,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                TextSpan(
                  text: ' $unit',
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    color: Colors.white.withAlpha(200),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── 2. Card: Lịch uống thuốc (UC-11) ──────────────────────────────────────────

class _MedicineScheduleCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MedicineScheduleViewModel>();

    // Tìm liều thuốc tiếp theo chưa uống
    final todaySchedules = vm.schedulesForSelectedDate;
    MedicineScheduleResponse? nextDose;
    for (final s in todaySchedules) {
      if (s.status == MedicineScheduleStatus.notYet) {
        nextDose = s;
        break;
      }
    }

    final total = vm.todayTotal;
    final taken = vm.todayTaken;
    final progress = total > 0 ? (taken / total) : 0.0;

    return GestureDetector(
      onTap: () => context.push('/health/medicine-schedule'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(4),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.medication_rounded,
                    size: 20,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              'Lịch uống thuốc',
                              style: GoogleFonts.inter(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withAlpha(12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Hôm nay',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Theo dõi và nhắc nhở uống thuốc đúng giờ',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: AppColors.textHint,
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Linear Progress Bar
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tiến độ hôm nay',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Flexible(
                      child: Text(
                        total > 0
                            ? 'Đã uống $taken/$total liều (${(progress * 100).toInt()}%)'
                            : 'Chưa có lịch hôm nay',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.end,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: total > 0 ? progress : 0,
                    minHeight: 6,
                    backgroundColor: AppColors.surfaceLight,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Next dose or status box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.canvasColor,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Icon(
                    nextDose != null
                        ? Icons.alarm_outlined
                        : (total > 0 && taken == total
                            ? Icons.check_circle_rounded
                            : Icons.info_outline_rounded),
                    size: 15,
                    color: nextDose != null
                        ? AppColors.primary
                        : (taken == total && total > 0
                            ? AppColors.success
                            : AppColors.textHint),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      nextDose != null
                          ? 'Liều tiếp theo: ${DateFormat('HH:mm').format(nextDose.scheduledAt)} — ${nextDose.medicineName} (${nextDose.dosage})'
                          : (total > 0 && taken == total
                              ? 'Bạn đã uống đủ thuốc hôm nay! Tuyệt vời! ✨'
                              : 'Nhấn để xem chi tiết danh mục thuốc'),
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: nextDose != null
                            ? AppColors.textPrimary
                            : AppColors.textSecondary,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            // Stats Chip Row (Wrap to avoid any overflow)
            if (total > 0) ...[
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _StatBadge(
                    label: '$taken đã uống',
                    color: AppColors.success,
                    icon: Icons.check_rounded,
                  ),
                  _StatBadge(
                    label: '${vm.todayRemaining} còn lại',
                    color: AppColors.primary,
                    icon: Icons.hourglass_empty_rounded,
                  ),
                  if (vm.todayOverdue > 0)
                    _StatBadge(
                      label: '${vm.todayOverdue} quá giờ',
                      color: AppColors.error,
                      icon: Icons.warning_amber_rounded,
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;

  const _StatBadge({
    required this.label,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(12),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withAlpha(40)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ── 3. Card: Theo dõi hoạt động sức khỏe (UC-08) ──────────────────────────────

class _DailyActivityCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<DailyActivitiesViewModel>();

    return GestureDetector(
      onTap: () => context.push('/health/daily-activities'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(4),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.monitor_heart_rounded,
                    size: 20,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              'Theo dõi hoạt động',
                              style: GoogleFonts.inter(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.success.withAlpha(12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Nhật ký',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.success,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Ghi chép bữa ăn, calo và bài tập thể lực',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: AppColors.textHint,
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Two-column Activity Summary Box
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.canvasColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  // Meals Column
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.orange.withAlpha(15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.restaurant_rounded,
                            size: 16,
                            color: AppColors.orange,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Dinh dưỡng',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${vm.mealsForSelectedDate.length} bữa • ${vm.totalCaloriesForSelectedDate.toInt()} kcal',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Divider
                  Container(
                    height: 26,
                    width: 1,
                    color: AppColors.borderLight,
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                  ),

                  // Workout Column
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            color: AppColors.teal.withAlpha(15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.directions_run_rounded,
                            size: 16,
                            color: AppColors.teal,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Luyện tập',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  color: AppColors.textSecondary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${vm.completedWorkoutsForSelectedDate}/${vm.workoutsForSelectedDate.length} hoàn thành',
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}



// ── 5. Card: Kiến thức & Tin tức sức khỏe (UC-12) ───────────────────────────

class _HealthNewsCard extends StatelessWidget {
  const _HealthNewsCard();

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'Tim mạch':
        return AppColors.error;
      case 'Dinh dưỡng':
        return AppColors.success;
      case 'Phòng bệnh':
        return AppColors.teal;
      case 'Lối sống':
        return AppColors.purple;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final newsVm = context.watch<HealthNewsViewModel>();
    final articles = newsVm.articles.take(2).toList();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
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
            // Top Row (Title header & navigation)
            InkWell(
              onTap: () => context.push('/health/news'),
              borderRadius: BorderRadius.circular(8),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppColors.teal.withAlpha(15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.menu_book_rounded,
                      size: 20,
                      color: AppColors.teal,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                'Kiến thức & Tin tức',
                                style: GoogleFonts.inter(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.teal.withAlpha(12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Mới',
                                style: GoogleFonts.inter(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.teal,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Cẩm nang dinh dưỡng, lối sống & phòng bệnh',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 14,
                    color: AppColors.textHint,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Dynamic Articles or Loading / Empty state
            if (newsVm.isLoading && newsVm.articles.isEmpty) ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 16),
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ] else if (articles.isNotEmpty) ...[
              ...articles.map((article) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: _MiniArticleTile(
                      category: article.category,
                      categoryColor: _getCategoryColor(article.category),
                      title: article.title,
                      readTime: article.estimatedReadTime,
                      onTap: () => context.push('/health/news/${article.newsId}'),
                    ),
                  )),
            ] else ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.canvasColor,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded,
                        size: 16, color: AppColors.textHint),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Chưa có bài viết mới',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 8),

            // "Xem tất cả bài viết" Link
            Center(
              child: InkWell(
                onTap: () => context.push('/health/news'),
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Xem tất cả bài viết y khoa',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.arrow_forward_rounded,
                        size: 14,
                        color: AppColors.primary,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MiniArticleTile extends StatelessWidget {
  final String category;
  final Color categoryColor;
  final String title;
  final String readTime;
  final VoidCallback onTap;

  const _MiniArticleTile({
    required this.category,
    required this.categoryColor,
    required this.title,
    required this.readTime,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
          decoration: BoxDecoration(
            color: AppColors.canvasColor,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: categoryColor.withAlpha(15),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text(
                  category,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: categoryColor,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                readTime,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  color: AppColors.textHint,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
