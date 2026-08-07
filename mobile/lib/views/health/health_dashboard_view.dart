import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';
import '../../view_models/medicine_schedule_viewmodel.dart';
import '../shared/coming_soon_widget.dart';

/// Tab 3 — Sức khỏe
/// Dashboard tổng hợp cho UC-09, UC-10, UC-11, UC-14.
class HealthDashboardView extends StatelessWidget {
  const HealthDashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MedicineScheduleViewModel(),
      child: Scaffold(
        backgroundColor: AppColors.canvasColor,
        body: SafeArea(
          child: Column(
            children: [
              _HealthHeader(),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _HealthSummaryBanner(),
                      const SizedBox(height: 28),
                      Text(
                        'Các tính năng sức khỏe',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                          letterSpacing: 0.4,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Column(
                        children: [
                          // UC-10 — Lịch uống thuốc (active, có navigate)
                          _MedicineHighlightCard(),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: ComingSoonFeatureCard(
                                  icon: Icons.monitor_heart_outlined,
                                  title: 'Theo dõi sức khỏe',
                                  description:
                                      'Ghi lại bữa ăn, luyện tập và chỉ số hàng ngày',
                                  color: const Color(0xFF10B981),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ComingSoonFeatureCard(
                                  icon: Icons.healing_outlined,
                                  title: 'Theo dõi điều trị',
                                  description:
                                      'Diễn biến bệnh và phác đồ điều trị',
                                  color: const Color(0xFF7C3AED),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
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
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chăm sóc bản thân',
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Sức khỏe',
                        style: GoogleFonts.inter(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFEF4444), Color(0xFFF97316)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 22),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
        ],
      ),
    );
  }
}

// ── Summary Banner ────────────────────────────────────────────────────────────

class _HealthSummaryBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0EA5E9), Color(0xFF06B6D4)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0EA5E9).withAlpha(60),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Xin chào! 👋',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: Colors.white.withAlpha(200),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Theo dõi sức khỏe\ncủa bạn mỗi ngày',
                  style: GoogleFonts.inter(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(30),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withAlpha(80), width: 1),
                  ),
                  child: Text(
                    '✨  Tính năng sắp ra mắt',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Icon(Icons.monitor_heart_rounded, size: 64, color: Colors.white.withAlpha(60)),
        ],
      ),
    );
  }
}

// ── Medicine Highlight Card (UC-10 — Navigate to full screen) ─────────────────

class _MedicineHighlightCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer<MedicineScheduleViewModel>(
      builder: (context, vm, _) {
        return GestureDetector(
          onTap: () => context.push('/health/medicine-schedule'),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF0EA5E9).withAlpha(60),
                  blurRadius: 14,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                // Icon
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(30),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withAlpha(60), width: 1),
                  ),
                  child: const Icon(Icons.medication_rounded, size: 28, color: Colors.white),
                ),
                const SizedBox(width: 14),

                // Title + mini stats
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Lịch uống thuốc',
                            style: GoogleFonts.inter(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(30),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: Colors.white.withAlpha(80)),
                            ),
                            child: Text(
                              'Mới',
                              style: GoogleFonts.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      // Mini stats hôm nay
                      if (vm.isLoading)
                        Text(
                          'Đang tải...',
                          style: GoogleFonts.inter(fontSize: 12, color: Colors.white.withAlpha(180)),
                        )
                      else
                        Row(
                          children: [
                            _MiniStat(
                              label: 'đã uống',
                              value: '${vm.todayTaken}/${vm.todayTotal}',
                              icon: Icons.check_circle_outline_rounded,
                            ),
                            if (vm.todayRemaining > 0) ...[
                              const SizedBox(width: 12),
                              _MiniStat(
                                label: 'còn lại',
                                value: '${vm.todayRemaining}',
                                icon: Icons.alarm_outlined,
                              ),
                            ],
                            if (vm.todayOverdue > 0) ...[
                              const SizedBox(width: 12),
                              _MiniStat(
                                label: 'quá giờ',
                                value: '${vm.todayOverdue}',
                                icon: Icons.warning_amber_rounded,
                                isWarning: true,
                              ),
                            ],
                          ],
                        ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),
                Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Colors.white.withAlpha(180)),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final bool isWarning;

  const _MiniStat({
    required this.label,
    required this.value,
    required this.icon,
    this.isWarning = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isWarning ? const Color(0xFFFBBF24) : Colors.white;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 4),
        Text(
          '$value $label',
          style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: color),
        ),
      ],
    );
  }
}
