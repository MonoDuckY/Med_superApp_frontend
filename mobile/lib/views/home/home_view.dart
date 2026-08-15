import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'HMS — Trang chủ',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        actions: [
          // UC-10: Notification bell (placeholder — đang phát triển)
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_outlined,
                    color: AppColors.textSecondary),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        '🔔 Thông báo sắp ra mắt!',
                        style: GoogleFonts.inter(fontSize: 13),
                      ),
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Section: UC-03 Đặt lịch khám ─────────────────────────────────
            Text(
              'UC-03 · Đặt lịch khám',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 12),

            _NavCard(
              icon: Icons.calendar_month_outlined,
              color: AppColors.primary,
              title: 'Lịch khám của tôi',
              subtitle: 'Xem danh sách lịch hẹn sắp tới',
              onTap: () => context.go('/schedule'),
            ),
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.add_circle_outline,
              color: AppColors.success,
              title: 'Đặt lịch mới',
              subtitle: 'Chọn thời gian → Bác sĩ → Thanh toán',
              onTap: () => context.push('/schedule/book'),
            ),

            const SizedBox(height: 20),

            // ── Section: UC-12 Góp ý & Phản hồi ─────────────────────────────
            Text(
              'UC-12 · Góp ý & Phản hồi',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 12),

            _NavCard(
              icon: Icons.rate_review_outlined,
              color: AppColors.teal,
              title: 'Góp ý & Phản hồi',
              subtitle: 'Đánh giá chất lượng dịch vụ sau khám',
              onTap: () => context.push('/schedule/feedback'),
            ),

            const SizedBox(height: 32),

            // ── Placeholder sections ──────────────────────────────────────────
            Text(
              'Sắp có',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
                letterSpacing: 0.4,
              ),
            ),
            const SizedBox(height: 12),

            _NavCard(
              icon: Icons.person_outline,
              color: AppColors.purple,
              title: 'Hồ sơ bệnh án',
              subtitle: 'Xem thông tin cá nhân và lịch sử khám',
              onTap: null,
              disabled: true,
            ),
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.medication_outlined,
              color: AppColors.primary,
              title: 'Lịch uống thuốc',
              subtitle: 'Nhắc nhở uống thuốc đúng giờ',
              onTap: null,
              disabled: true,
            ),
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.newspaper_outlined,
              color: AppColors.teal600,
              title: 'Tin tức sức khỏe',
              subtitle: 'Bài viết y tế và lời khuyên sức khỏe',
              onTap: null,
              disabled: true,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Nav Card ───────────────────────────────────────────────────────────────────

class _NavCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool disabled;

  const _NavCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: disabled ? null : onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: disabled ? AppColors.surfaceLight : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: disabled
                ? AppColors.borderLight
                : color.withAlpha(60),
          ),
          boxShadow: disabled
              ? null
              : [
                  BoxShadow(
                    color: color.withAlpha(20),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: disabled
                    ? AppColors.borderLight
                    : color.withAlpha(25),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 22,
                color: disabled ? AppColors.textHint : color,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: disabled
                          ? AppColors.textHint
                          : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            if (!disabled)
              Icon(
                Icons.chevron_right,
                size: 20,
                color: color.withAlpha(180),
              ),
          ],
        ),
      ),
    );
  }
}

