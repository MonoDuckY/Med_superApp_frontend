import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../view_models/login_viewmodel.dart';
import '../../core/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/utils/l10n_extension.dart';
import '../../core/config/environment_config.dart';

class LoginView extends StatelessWidget {
  const LoginView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => LoginViewModel(),
      child: const _LoginBody(),
    );
  }
}

class _LoginBody extends StatelessWidget {
  const _LoginBody();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<LoginViewModel>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),

              // ── Top bar: step indicator ─────────────────────────────────
              const Row(
                children: [
                  SizedBox(width: 38), // balance placeholder
                  Spacer(),
                  _StepIndicator(currentStep: 0, totalSteps: 2),
                  Spacer(),
                  SizedBox(width: 38),
                ],
              ),

              const SizedBox(height: 32),

              // ── Logo + Badge ─────────────────────────────────────────────
              Container(
                width: 76,
                height: 76,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [AppColors.sky400, AppColors.primary],
                  ),
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 24,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.add_rounded,
                    color: Colors.white,
                    size: 42,
                  ),
                ),
              ),

              const SizedBox(height: 18),

              // ── Branding Pill ─────────────────────────────────────────────
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.sky100,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.sky200),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.verified_rounded, size: 14, color: AppColors.primary),
                    const SizedBox(width: 6),
                    Text(
                      'HMS — NEXTGEN HEALTHCARE',
                      style: AppTypography.badge.copyWith(
                        color: AppColors.primary,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── Title & Subtitle ──────────────────────────────────────────
              Text(
                'Chào mừng đến với HMS',
                textAlign: TextAlign.center,
                style: AppTypography.h2.copyWith(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  height: 1.25,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                'Nền tảng y tế số thông minh & bảo mật',
                textAlign: TextAlign.center,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),

              const SizedBox(height: 36),

              // ── Phone Field ───────────────────────────────────────────────
              Row(
                children: [
                  const Icon(Icons.phone_iphone_rounded, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    context.l10n.phoneNumber,
                    style: AppTypography.subtitle.copyWith(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              TextFormField(
                keyboardType: TextInputType.phone,
                inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9+\s\-()]'))],
                onChanged: vm.setPhoneNumber,
                style: AppTypography.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
                decoration: InputDecoration(
                  hintText: 'Nhập số điện thoại (vd: 0912345678)',
                  hintStyle: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textHint,
                  ),
                  prefixIcon: const Icon(
                    Icons.dialpad_rounded,
                    color: AppColors.textSecondary,
                    size: 20,
                  ),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.borderLight),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.borderLight),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),

              if (vm.errorMessage != null) ...[
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.red100.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, size: 16, color: AppColors.error),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          vm.errorMessage!,
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.error,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),

              // ── Login Button ──────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: vm.isValid && !vm.isLoading
                      ? () async {
                          final result = await vm.requestOtp();
                          if (!context.mounted) return;
                          if (result == LoginStepResult.authenticated) {
                            context.go('/home');
                          } else if (result == LoginStepResult.requiresOtp) {
                            final encoded = Uri.encodeComponent(vm.phoneNumber.trim());
                            context.push('/otp/$encoded');
                          }
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.sky200,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: vm.isLoading
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              context.l10n.login,
                              style: AppTypography.button,
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward_rounded, size: 18, color: Colors.white),
                          ],
                        ),
                ),
              ),

              const SizedBox(height: 40),

              // ── Footer ────────────────────────────────────────────────────
              Text(
                'HMS Patient Portal · v2.4.1',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary.withValues(alpha: 0.6),
                ),
              ),

               const SizedBox(height: 24),

              // ── [DEV] Dev Banner — hidden in release builds ──────────────
              if (kDebugMode) ...[  
                const SizedBox(height: 8),
                const _DevBanner(),
                const SizedBox(height: 8),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// ── Widget: Step indicator ─────────────────────────────────────────────────
class _StepIndicator extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  const _StepIndicator({required this.currentStep, required this.totalSteps});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(totalSteps, (i) {
        final isActive = i == currentStep;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: isActive ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary : AppColors.slate300Alt,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}

class _DevBanner extends StatefulWidget {
  const _DevBanner();

  @override
  State<_DevBanner> createState() => _DevBannerState();
}

class _DevBannerState extends State<_DevBanner> {
  bool _isMock = false;

  @override
  void initState() {
    super.initState();
    _isMock = EnvironmentConfig.isMock;
  }

  void _toggleMock(bool value) async {
    await EnvironmentConfig.setMock(value);
    setState(() {
      _isMock = value;
    });
    if (mounted) {
      context.read<LoginViewModel>().updateMockState();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã đổi sang chế độ: ${value ? "Mock Data" : "Real API"}'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<LoginViewModel>();
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.orange50,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.orange200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.bolt, size: 14, color: AppColors.orange),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      context.l10n.devMode,
                      style: AppTypography.badge.copyWith(
                        color: AppColors.orange700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    context.l10n.useMockData,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Switch(
                    value: _isMock,
                    onChanged: _toggleMock,
                    activeThumbColor: AppColors.orange,
                  ),
                ],
              ),
              if (_isMock) ...[
                const Divider(height: 16, color: AppColors.orange200),
                GestureDetector(
                  onTap: () async {
                    final success = await vm.devBypassLogin();
                    if (context.mounted && success) {
                      context.go('/home');
                    }
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.login, size: 16, color: AppColors.orange700),
                        const SizedBox(width: 8),
                        Text(
                          context.l10n.skipLogin,
                          style: AppTypography.subtitle.copyWith(
                            color: AppColors.orange700,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
