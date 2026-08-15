import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../view_models/profile_viewmodel.dart';

/// UC-05 — Màn hình Thông tin cá nhân (Hồ sơ y tế định danh).
/// Chế độ chỉ xem (Read-only) tuân thủ tài liệu đặc tả UCS và API Backend.
class PersonalInfoView extends StatelessWidget {
  const PersonalInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProfileViewModel()..loadProfile(),
      child: const _PersonalInfoScaffold(),
    );
  }
}

// ── Scaffold & Body ──────────────────────────────────────────────────────────

class _PersonalInfoScaffold extends StatelessWidget {
  const _PersonalInfoScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<ProfileViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 18, color: AppColors.textPrimary),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/profile');
            }
          },
        ),
        title: Text(
          'Thông tin cá nhân',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: vm.isLoading
          ? const _LoadingSkeleton()
          : RefreshIndicator(
              onRefresh: () => vm.loadProfile(),
              color: AppColors.primary,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                    parent: BouncingScrollPhysics()),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 36),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Avatar & Summary Card ──────────────────────────────
                    _AvatarSummaryCard(vm: vm),
                    const SizedBox(height: 24),

                    // ── Section: Thông tin cơ bản ──────────────────────────
                    _SectionHeader(label: 'Thông tin cơ bản'),
                    const SizedBox(height: 12),
                    _InfoRowCard(
                      icon: Icons.person_outline_rounded,
                      iconColor: AppColors.primary,
                      label: 'Họ và tên',
                      value: vm.fullName.isNotEmpty ? vm.fullName : '—',
                    ),
                    const SizedBox(height: 10),
                    _InfoRowCard(
                      icon: Icons.phone_outlined,
                      iconColor: AppColors.teal,
                      label: 'Số điện thoại',
                      value: vm.phoneNumber.isNotEmpty ? vm.phoneNumber : '—',
                    ),
                    const SizedBox(height: 10),
                    _InfoRowCard(
                      icon: Icons.wc_rounded,
                      iconColor: AppColors.purple,
                      label: 'Giới tính',
                      value: vm.genderLabel,
                    ),
                    const SizedBox(height: 10),
                    _InfoRowCard(
                      icon: Icons.cake_outlined,
                      iconColor: AppColors.warning,
                      label: 'Ngày sinh',
                      value: vm.formattedDateOfBirth,
                    ),

                    if (vm.address.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      _InfoRowCard(
                        icon: Icons.location_on_outlined,
                        iconColor: AppColors.orange,
                        label: 'Địa chỉ',
                        value: vm.address,
                      ),
                    ],

                    if (vm.citizenId.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      _InfoRowCard(
                        icon: Icons.credit_card_outlined,
                        iconColor: AppColors.teal,
                        label: 'Số CCCD / Định danh',
                        value: vm.citizenId,
                      ),
                    ],

                    if (vm.healthInsuranceCode.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      _InfoRowCard(
                        icon: Icons.health_and_safety_outlined,
                        iconColor: AppColors.success,
                        label: 'Mã thẻ BHYT',
                        value: vm.healthInsuranceCode,
                      ),
                    ],

                    const SizedBox(height: 24),

                    // ── Section: Tài khoản ──────────────────────────────────
                    _SectionHeader(label: 'Thông tin tài khoản'),
                    const SizedBox(height: 12),
                    _StatusCard(vm: vm),

                    const SizedBox(height: 24),

                    // ── Notice Banner (Medical Data Policy) ─────────────────
                    _MedicalDataNoticeBanner(),
                  ],
                ),
              ),
            ),
    );
  }
}

// ── Avatar Summary Card ───────────────────────────────────────────────────────

class _AvatarSummaryCard extends StatelessWidget {
  final ProfileViewModel vm;
  const _AvatarSummaryCard({required this.vm});

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
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          // Gradient Circle Avatar
          Container(
            width: 80,
            height: 80,
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
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Center(
              child: Text(
                vm.initials,
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Full Name
          Text(
            vm.fullName.isNotEmpty ? vm.fullName : 'Bệnh nhân',
            style: GoogleFonts.inter(
              fontSize: 19,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),

          // Phone
          if (vm.phoneNumber.isNotEmpty)
            Text(
              vm.phoneNumber,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),

          const SizedBox(height: 10),

          // Role Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.verified_user_outlined,
                    size: 14, color: AppColors.primary),
                const SizedBox(width: 5),
                Text(
                  'Hồ sơ bệnh nhân',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
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

// ── Info Row Card (Read-only) ─────────────────────────────────────────────────

class _InfoRowCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  const _InfoRowCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
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
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textHint,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.lock_outline_rounded,
            size: 15,
            color: AppColors.textHint,
          ),
        ],
      ),
    );
  }
}

// ── Status Card ───────────────────────────────────────────────────────────────

class _StatusCard extends StatelessWidget {
  final ProfileViewModel vm;
  const _StatusCard({required this.vm});

  @override
  Widget build(BuildContext context) {
    final isActive = vm.isActive;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: (isActive ? AppColors.success : AppColors.error)
                  .withAlpha(15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.shield_outlined,
              size: 19,
              color: isActive ? AppColors.success : AppColors.error,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Trạng thái tài khoản',
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textHint,
                    letterSpacing: 0.2,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  isActive ? 'Đang hoạt động' : 'Đã khóa',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isActive ? AppColors.success : AppColors.error,
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

// ── Notice Banner (Medical Data Policy) ───────────────────────────────────────

class _MedicalDataNoticeBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(10),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.info_outline_rounded,
              size: 18,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bảo mật hồ sơ y tế',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Thông tin định danh bệnh nhân được đối chiếu với cơ sở dữ liệu y tế. Để thay đổi hoặc đính chính thông tin cá nhân, quý khách vui lòng liên hệ quầy tiếp đón bệnh viện.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    height: 1.45,
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

// ── Loading Skeleton ──────────────────────────────────────────────────────────

class _LoadingSkeleton extends StatefulWidget {
  const _LoadingSkeleton();

  @override
  State<_LoadingSkeleton> createState() => _LoadingSkeletonState();
}

class _LoadingSkeletonState extends State<_LoadingSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.3, end: 0.7).animate(
        CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (context2, child2) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
        child: Column(
          children: [
            // Avatar card skeleton
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  _Shimmer(width: 80, height: 80, radius: 40, opacity: _anim.value),
                  const SizedBox(height: 14),
                  _Shimmer(width: 160, height: 18, radius: 6, opacity: _anim.value),
                  const SizedBox(height: 8),
                  _Shimmer(width: 100, height: 13, radius: 6, opacity: _anim.value),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Field skeletons
            for (int i = 0; i < 4; i++) ...[
              _Shimmer(
                width: double.infinity,
                height: 64,
                radius: 14,
                opacity: _anim.value,
              ),
              const SizedBox(height: 10),
            ],
          ],
        ),
      ),
    );
  }
}

class _Shimmer extends StatelessWidget {
  final double width;
  final double height;
  final double radius;
  final double opacity;

  const _Shimmer({
    required this.width,
    required this.height,
    required this.radius,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: opacity,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}
