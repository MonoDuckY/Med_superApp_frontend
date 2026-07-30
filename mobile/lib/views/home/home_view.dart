import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/app_colors.dart';

class HomeView extends StatelessWidget {
  const HomeView({super.key});

  Future<void> _logout(BuildContext context) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', false);
    if (context.mounted) {
      context.go('/login');
    }
  }

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
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.textSecondary),
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── [DEV] Hint banner ─────────────────────────────────────────────
            if (kDebugMode) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF7ED),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFED7AA)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.bolt,
                        size: 14, color: Color(0xFFF97316)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'DEV MODE  ·  Mock OTP: 123456  ·  Phone: 0123456789',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFFC2410C),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

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
              onTap: () => context.push('/appointments'),
            ),
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.add_circle_outline,
              color: AppColors.success,
              title: 'Đặt lịch mới',
              subtitle: 'Chọn thời gian → Bác sĩ → Thanh toán',
              onTap: () => context.push('/appointment/book'),
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
              title: 'Hồ sơ bệnh nhân',
              subtitle: 'Xem thông tin cá nhân và lịch sử khám',
              onTap: null,
              disabled: true,
            ),
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.description_outlined,
              color: AppColors.warning,
              title: 'Kết quả xét nghiệm',
              subtitle: 'Hình ảnh chẩn đoán và AI analysis',
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
