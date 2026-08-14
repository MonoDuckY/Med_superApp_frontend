import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/config/environment_config.dart';
import '../../services/mock/mock_auth_service.dart';
import '../../services/remote/auth_service.dart';

/// Tab 4 — Hồ sơ
/// Thông tin cá nhân, hồ sơ bệnh án (UC-06), cài đặt tài khoản.
class ProfilePlaceholderView extends StatelessWidget {
  const ProfilePlaceholderView({super.key});

  Future<void> _doLogout(BuildContext context) async {
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
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ─────────────────────────────────────────────────────────
            _ProfileHeader(),

            // ── Content ────────────────────────────────────────────────────────
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                child: Column(
                  children: [
                    // ── Avatar card ─────────────────────────────────────────────
                    _AvatarCard(),
                    const SizedBox(height: 24),

                    // ── UC-06: Hồ sơ bệnh án ───────────────────────────────────
                    _SectionLabel(label: 'Hồ sơ y tế'),
                    const SizedBox(height: 12),
                    _ProfileMenuItem(
                      icon: Icons.folder_shared_outlined,
                      iconColor: AppColors.primary,
                      title: 'Hồ sơ bệnh án',
                      subtitle: 'Lịch sử khám và chẩn đoán',
                      onTap: () => context.push('/profile/medical-records'),
                    ),
                    const SizedBox(height: 8),
                    _ProfileMenuItem(
                      icon: Icons.science_outlined,
                      iconColor: AppColors.warning,
                      title: 'Kết quả xét nghiệm',
                      subtitle: 'Hình ảnh và chỉ số xét nghiệm',
                      badge: 'Sắp có',
                      onTap: () => _showComingSoon(context,
                          'Kết quả xét nghiệm đang được phát triển'),
                    ),

                    const SizedBox(height: 24),

                    // ── Tài khoản ───────────────────────────────────────────────
                    _SectionLabel(label: 'Tài khoản'),
                    const SizedBox(height: 12),
                    _ProfileMenuItem(
                      icon: Icons.person_outline_rounded,
                      iconColor: AppColors.purple,
                      title: 'Thông tin cá nhân',
                      subtitle: 'Tên, số điện thoại, ngày sinh',
                      onTap: () => context.push('/profile/personal-info'),
                    ),
                    const SizedBox(height: 8),
                    _ProfileMenuItem(
                      icon: Icons.notifications_outlined,
                      iconColor: AppColors.teal,
                      title: 'Cài đặt thông báo',
                      subtitle: 'Quản lý nhắc nhở và thông báo',
                      badge: 'Sắp có',
                      onTap: () => _showComingSoon(
                          context, 'Cài đặt thông báo đang được phát triển'),
                    ),

                    const SizedBox(height: 24),

                    // ── Hỗ trợ & Đánh giá (UC-13) ───────────────────────────────
                    _SectionLabel(label: 'Hỗ trợ & Đánh giá'),
                    const SizedBox(height: 12),
                    _ProfileMenuItem(
                      icon: Icons.rate_review_outlined,
                      iconColor: AppColors.orange,
                      title: 'Đánh giá & Góp ý',
                      subtitle: 'Phản hồi chất lượng dịch vụ và khám bệnh',
                      onTap: () => context.push('/profile/feedback'),
                    ),

                    const SizedBox(height: 24),

                    // ── Đăng xuất ───────────────────────────────────────────────
                    _SectionLabel(label: 'Khác'),
                    const SizedBox(height: 12),
                    _ProfileMenuItem(
                      icon: Icons.logout_rounded,
                      iconColor: AppColors.error,
                      title: 'Đăng xuất',
                      subtitle: 'Thoát khỏi tài khoản',
                      onTap: () => _confirmLogout(context),
                      isDanger: true,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '🚧 $message',
          style: GoogleFonts.inter(fontSize: 13),
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Đăng xuất',
          style: GoogleFonts.inter(fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Bạn có chắc chắn muốn đăng xuất không?',
          style: GoogleFonts.inter(
              fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text('Hủy',
                style: GoogleFonts.inter(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _doLogout(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Đăng xuất',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _ProfileHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tài khoản',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Hồ sơ',
                  style: GoogleFonts.inter(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
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

// ── Avatar Card ───────────────────────────────────────────────────────────────

class _AvatarCard extends StatefulWidget {
  @override
  State<_AvatarCard> createState() => _AvatarCardState();
}

class _AvatarCardState extends State<_AvatarCard> {
  String _userName = 'Nguyễn Văn A';

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    var name = prefs.getString(AppConstants.keyUserName) ??
        prefs.getString(AppConstants.keyUserData) ??
        'Nguyễn Văn A';
    if (RegExp(r'^\d+$').hasMatch(name.trim())) {
      name = 'Nguyễn Văn A';
    }
    if (mounted) {
      setState(() {
        _userName = name;
      });
    }

    try {
      final authService = EnvironmentConfig.isMock
          ? MockAuthService()
          : RemoteAuthService();
      final res = await authService.getProfile();
      if (res.success && res.data != null) {
        final u = res.data!;
        if (u.fullName != null && u.fullName!.isNotEmpty) {
          await prefs.setString(AppConstants.keyUserName, u.fullName!);
          if (mounted) {
            setState(() {
              _userName = u.fullName!;
            });
          }
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 62,
            height: 62,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.teal],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withAlpha(60),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.person_rounded,
              size: 34,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 16),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _userName,
                  style: GoogleFonts.inter(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Bệnh nhân',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textSecondary,
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

// ── Section Label ─────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        label.toUpperCase(),
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.textHint,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

// ── Profile Menu Item ─────────────────────────────────────────────────────────

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final String? badge;
  final VoidCallback onTap;
  final bool isDanger;

  const _ProfileMenuItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    this.subtitle,
    this.badge,
    required this.onTap,
    this.isDanger = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDanger
                ? AppColors.error.withAlpha(40)
                : AppColors.borderLight,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconColor.withAlpha(15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 19, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: isDanger ? AppColors.error : AppColors.textPrimary,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 6),
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  badge!,
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textHint,
                  ),
                ),
              ),
            Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: isDanger
                  ? AppColors.error.withAlpha(160)
                  : AppColors.textHint,
            ),
          ],
        ),
      ),
    );
  }
}
