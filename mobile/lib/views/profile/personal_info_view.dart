import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../view_models/profile_viewmodel.dart';

/// UC-04 — Màn hình Thông tin cá nhân.
/// Cho phép bệnh nhân xem và cập nhật: họ tên, giới tính, ngày sinh.
/// Số điện thoại và ID bệnh nhân chỉ đọc.
class PersonalInfoView extends StatelessWidget {
  const PersonalInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ProfileViewModel()..loadProfile(),
      child: const _PersonalInfoBody(),
    );
  }
}

// ── Body (Consumer của ProfileViewModel) ─────────────────────────────────────

class _PersonalInfoBody extends StatefulWidget {
  const _PersonalInfoBody();

  @override
  State<_PersonalInfoBody> createState() => _PersonalInfoBodyState();
}

class _PersonalInfoBodyState extends State<_PersonalInfoBody> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _nameControllerSynced = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  /// Sync TextEditingController 1 lần khi data load xong.
  void _syncController(ProfileViewModel vm) {
    if (!_nameControllerSynced && !vm.isLoading && vm.user != null) {
      _nameController.text = vm.fullName;
      _nameControllerSynced = true;
    }
  }

  Future<bool> _onWillPop(ProfileViewModel vm) async {
    if (!vm.isDirty) return true;
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text('Bỏ thay đổi?',
            style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Text(
          'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn thoát không?',
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text('Ở lại',
                style: GoogleFonts.inter(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text('Thoát',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  Future<void> _save(ProfileViewModel vm) async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    FocusScope.of(context).unfocus();

    final success = await vm.saveProfile();

    if (!mounted) return;
    if (success) {
      HapticFeedback.lightImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded,
                  color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text(vm.successMessage ?? 'Đã lưu thành công',
                  style: GoogleFonts.inter(fontSize: 13)),
            ],
          ),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(vm.errorMessage ?? 'Có lỗi xảy ra',
              style: GoogleFonts.inter(fontSize: 13)),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProfileViewModel>(
      builder: (context, vm, _) {
        _syncController(vm);

        return PopScope(
          canPop: !vm.isDirty,
          onPopInvokedWithResult: (didPop, _) async {
            if (didPop) return;
            final canLeave = await _onWillPop(vm);
            if (canLeave && context.mounted) {
              Navigator.of(context).pop();
            }
          },
          child: Scaffold(
            backgroundColor: AppColors.canvasColor,
            appBar: _buildAppBar(context, vm),
            body: vm.isLoading
                ? const _LoadingSkeleton()
                : GestureDetector(
                    onTap: () => FocusScope.of(context).unfocus(),
                    child: SingleChildScrollView(
                      padding:
                          const EdgeInsets.fromLTRB(20, 24, 20, 40),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── Avatar ───────────────────────────────────
                            _AvatarSection(vm: vm),
                            const SizedBox(height: 28),

                            // ── Thông tin cơ bản ─────────────────────────
                            _SectionHeader(label: 'Thông tin cơ bản'),
                            const SizedBox(height: 14),
                            _FullNameField(
                                controller: _nameController, vm: vm),
                            const SizedBox(height: 12),
                            _PhoneField(vm: vm),
                            const SizedBox(height: 12),
                            _GenderField(vm: vm),
                            const SizedBox(height: 12),
                            _DateOfBirthField(vm: vm),

                            const SizedBox(height: 28),

                            // ── Thông tin tài khoản ──────────────────────
                            _SectionHeader(label: 'Thông tin tài khoản'),
                            const SizedBox(height: 14),
                            _PatientIdCard(vm: vm),
                            const SizedBox(height: 12),
                            _StatusCard(vm: vm),

                            const SizedBox(height: 32),

                            // ── Nút Lưu (cho mobile nhỏ) ─────────────────
                            _SaveButton(vm: vm, onSave: () => _save(vm)),
                          ],
                        ),
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }

  PreferredSizeWidget _buildAppBar(
      BuildContext context, ProfileViewModel vm) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 1,
      surfaceTintColor: Colors.white,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded,
            size: 18, color: AppColors.textPrimary),
        onPressed: () async {
          if (!vm.isDirty) {
            Navigator.of(context).pop();
            return;
          }
          final canLeave = await _onWillPop(vm);
          if (canLeave && context.mounted) Navigator.of(context).pop();
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
      actions: [
        if (vm.isDirty && !vm.isSaving)
          TextButton(
            onPressed: () => _save(vm),
            child: Text(
              'Lưu',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
            ),
          ),
        if (vm.isSaving)
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Center(
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppColors.primary),
              ),
            ),
          ),
      ],
    );
  }
}

// ── Avatar Section ────────────────────────────────────────────────────────────

class _AvatarSection extends StatelessWidget {
  final ProfileViewModel vm;
  const _AvatarSection({required this.vm});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          Container(
            width: 88,
            height: 88,
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
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            vm.fullName.isNotEmpty ? vm.fullName : 'Bệnh nhân',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            vm.user?.phoneNumber ?? '',
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textSecondary,
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

// ── Họ và tên ─────────────────────────────────────────────────────────────────

class _FullNameField extends StatelessWidget {
  final TextEditingController controller;
  final ProfileViewModel vm;
  const _FullNameField({required this.controller, required this.vm});

  @override
  Widget build(BuildContext context) {
    return _FieldCard(
      icon: Icons.person_outline_rounded,
      iconColor: AppColors.primary,
      label: 'Họ và tên',
      child: TextFormField(
        controller: controller,
        style: GoogleFonts.inter(
            fontSize: 15, color: AppColors.textPrimary),
        decoration: const InputDecoration(
          border: InputBorder.none,
          hintText: 'Nhập họ và tên',
          hintStyle: TextStyle(color: AppColors.textHint),
          isDense: true,
          contentPadding: EdgeInsets.zero,
        ),
        textCapitalization: TextCapitalization.words,
        onChanged: vm.setFullName,
        validator: vm.validateFullName,
      ),
    );
  }
}

// ── Số điện thoại (readonly) ──────────────────────────────────────────────────

class _PhoneField extends StatelessWidget {
  final ProfileViewModel vm;
  const _PhoneField({required this.vm});

  @override
  Widget build(BuildContext context) {
    return _FieldCard(
      icon: Icons.phone_outlined,
      iconColor: AppColors.teal,
      label: 'Số điện thoại',
      trailing: const Icon(Icons.lock_outline_rounded,
          size: 14, color: AppColors.textHint),
      child: Text(
        vm.user?.phoneNumber ?? '—',
        style: GoogleFonts.inter(
          fontSize: 15,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}

// ── Giới tính (dropdown) ──────────────────────────────────────────────────────

class _GenderField extends StatelessWidget {
  final ProfileViewModel vm;
  const _GenderField({required this.vm});

  static const _options = [
    ('MALE', 'Nam'),
    ('FEMALE', 'Nữ'),
    ('OTHER', 'Khác'),
  ];

  @override
  Widget build(BuildContext context) {
    return _FieldCard(
      icon: Icons.wc_rounded,
      iconColor: AppColors.purple,
      label: 'Giới tính',
      child: DropdownButtonFormField<String>(
        initialValue: vm.gender.isEmpty ? null : vm.gender,
        hint: Text('Chọn giới tính',
            style: GoogleFonts.inter(
                fontSize: 15, color: AppColors.textHint)),
        isExpanded: true,
        decoration: const InputDecoration(
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.zero,
        ),
        style: GoogleFonts.inter(
            fontSize: 15, color: AppColors.textPrimary),
        icon: const Icon(Icons.keyboard_arrow_down_rounded,
            color: AppColors.textHint, size: 20),
        items: _options
            .map((opt) => DropdownMenuItem(
                  value: opt.$1,
                  child: Text(opt.$2,
                      style: GoogleFonts.inter(fontSize: 15)),
                ))
            .toList(),
        onChanged: (v) {
          if (v != null) vm.setGender(v);
        },
      ),
    );
  }
}

// ── Ngày sinh (date picker) ───────────────────────────────────────────────────

class _DateOfBirthField extends StatelessWidget {
  final ProfileViewModel vm;
  const _DateOfBirthField({required this.vm});

  Future<void> _pickDate(BuildContext context) async {
    DateTime initial = DateTime(1990);
    if (vm.dateOfBirth.isNotEmpty) {
      try {
        initial = DateTime.parse(vm.dateOfBirth);
      } catch (_) {}
    }

    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      locale: const Locale('vi', 'VN'),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
            onSurface: AppColors.textPrimary,
          ),
        ),
        child: child!,
      ),
    );

    if (picked != null) {
      // Lưu dạng ISO-8601 (yyyy-MM-dd)
      final iso = '${picked.year.toString().padLeft(4, '0')}'
          '-${picked.month.toString().padLeft(2, '0')}'
          '-${picked.day.toString().padLeft(2, '0')}';
      vm.setDateOfBirth(iso);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _pickDate(context),
      child: _FieldCard(
        icon: Icons.cake_outlined,
        iconColor: AppColors.warning,
        label: 'Ngày sinh',
        trailing: const Icon(Icons.calendar_today_rounded,
            size: 14, color: AppColors.textHint),
        child: FormField<String>(
          initialValue: vm.dateOfBirth,
          validator: (_) => vm.validateDateOfBirth(vm.dateOfBirth),
          builder: (state) => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                vm.formattedDateOfBirth.isNotEmpty
                    ? vm.formattedDateOfBirth
                    : 'Chọn ngày sinh',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: vm.dateOfBirth.isEmpty
                      ? AppColors.textHint
                      : AppColors.textPrimary,
                ),
              ),
              if (state.hasError) ...[
                const SizedBox(height: 4),
                Text(state.errorText!,
                    style: GoogleFonts.inter(
                        fontSize: 11, color: AppColors.error)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── ID Bệnh nhân (readonly card) ──────────────────────────────────────────────

class _PatientIdCard extends StatelessWidget {
  final ProfileViewModel vm;
  const _PatientIdCard({required this.vm});

  @override
  Widget build(BuildContext context) {
    final patientId = vm.user?.patientId;
    final displayId = patientId != null
        ? 'BN-${patientId.padLeft(5, '0')}'
        : '—';
    return _FieldCard(
      icon: Icons.badge_outlined,
      iconColor: AppColors.teal,
      label: 'Mã bệnh nhân',
      trailing: const Icon(Icons.lock_outline_rounded,
          size: 14, color: AppColors.textHint),
      child: Row(
        children: [
          Text(
            displayId,
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Trạng thái tài khoản ──────────────────────────────────────────────────────

class _StatusCard extends StatelessWidget {
  final ProfileViewModel vm;
  const _StatusCard({required this.vm});

  @override
  Widget build(BuildContext context) {
    final isActive = (vm.user?.status ?? 'ACTIVE') == 'ACTIVE';
    return _FieldCard(
      icon: Icons.shield_outlined,
      iconColor: isActive ? AppColors.success : AppColors.error,
      label: 'Trạng thái tài khoản',
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: (isActive ? AppColors.success : AppColors.error)
              .withAlpha(20),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          isActive ? 'Đang hoạt động' : 'Đã khóa',
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isActive ? AppColors.success : AppColors.error,
          ),
        ),
      ),
    );
  }
}

// ── Nút Lưu (bottom của form) ─────────────────────────────────────────────────

class _SaveButton extends StatelessWidget {
  final ProfileViewModel vm;
  final VoidCallback onSave;
  const _SaveButton({required this.vm, required this.onSave});

  @override
  Widget build(BuildContext context) {
    final canSave = vm.isDirty && !vm.isSaving;
    return AnimatedOpacity(
      opacity: canSave ? 1.0 : 0.4,
      duration: const Duration(milliseconds: 200),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: canSave ? onSave : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            disabledBackgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14)),
            elevation: canSave ? 3 : 0,
          ),
          child: vm.isSaving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2.5, color: Colors.white),
                )
              : Text(
                  'Lưu thay đổi',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                  ),
                ),
        ),
      ),
    );
  }
}

// ── Reusable Field Card ───────────────────────────────────────────────────────

class _FieldCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final Widget child;
  final Widget? trailing;

  const _FieldCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.child,
    this.trailing,
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
            color: Colors.black.withAlpha(5),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: iconColor.withAlpha(15),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 14),
          // Content
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
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 5),
                child,
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: 8),
            Padding(
              padding: const EdgeInsets.only(top: 10),
              child: trailing!,
            ),
          ],
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
        padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
        child: Column(
          children: [
            // Avatar skeleton
            Center(
              child: Column(
                children: [
                  _Shimmer(width: 88, height: 88, radius: 44,
                      opacity: _anim.value),
                  const SizedBox(height: 12),
                  _Shimmer(width: 160, height: 18, radius: 6,
                      opacity: _anim.value),
                  const SizedBox(height: 6),
                  _Shimmer(width: 100, height: 13, radius: 6,
                      opacity: _anim.value),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Field skeletons
            for (int i = 0; i < 4; i++) ...[
              _Shimmer(
                  width: double.infinity, height: 72, radius: 14,
                  opacity: _anim.value),
              const SizedBox(height: 12),
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
          color: AppColors.borderLight,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}
