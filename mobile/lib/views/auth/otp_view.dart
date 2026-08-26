import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../view_models/otp_viewmodel.dart';
import '../../core/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_radius.dart';
import '../../core/utils/l10n_extension.dart';

class OtpView extends StatelessWidget {
  final String phoneNumber;
  const OtpView({super.key, required this.phoneNumber});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => OtpViewModel(phoneNumber: Uri.decodeComponent(phoneNumber)),
      child: const _OtpBody(),
    );
  }
}

class _OtpBody extends StatefulWidget {
  const _OtpBody();

  @override
  State<_OtpBody> createState() => _OtpBodyState();
}

class _OtpBodyState extends State<_OtpBody> {
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());

  @override
  void dispose() {
    for (final n in _focusNodes) { n.dispose(); }
    for (final c in _controllers) { c.dispose(); }
    super.dispose();
  }

  void _onDigitChanged(OtpViewModel vm, int index, String value) {
    if (value.isEmpty) {
      vm.setDigit(index, '');
      if (index > 0) _focusNodes[index - 1].requestFocus();
      return;
    }
    // Chỉ lấy ký tự cuối cùng nếu người dùng paste nhiều số
    final digit = value.replaceAll(RegExp(r'[^0-9]'), '');
    if (digit.isEmpty) return;

    // Paste 6 chữ số liền một lúc
    if (digit.length == 6) {
      for (int i = 0; i < 6; i++) {
        vm.setDigit(i, digit[i]);
        _controllers[i].text = digit[i];
      }
      _focusNodes[5].requestFocus();
      return;
    }

    final singleDigit = digit[digit.length - 1];
    _controllers[index].text = singleDigit;
    _controllers[index].selection = const TextSelection.collapsed(offset: 1);
    vm.setDigit(index, singleDigit);
    if (index < 5) _focusNodes[index + 1].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<OtpViewModel>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: AppSpacing.xl),

              // ── Top bar: back + step indicator ───────────────────────────
              Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        border: Border.all(color: AppColors.borderLight),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.arrow_back_ios_new_rounded,
                          size: 16, color: AppColors.textPrimary),
                    ),
                  ),
                  const Spacer(),
                  const _StepIndicator(currentStep: 1, totalSteps: 2),
                  const Spacer(),
                  const SizedBox(width: 38), // balance
                ],
              ),

              const SizedBox(height: AppSpacing.huge),

              // ── Logo + badge ──────────────────────────────────────────────
              Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [AppColors.sky400, AppColors.primary],
                      ),
                      borderRadius: AppRadius.cardBorder,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.35),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 36),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.sky100,
                      borderRadius: AppRadius.chipBorder,
                      border: Border.all(color: AppColors.sky200),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.verified_rounded,
                            size: 12, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          'SMS Verification',
                          style: AppTypography.badge.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.xxl),

              // ── Title ─────────────────────────────────────────────────────
              Text(
                context.l10n.enterOtp,
                style: AppTypography.h2,
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: AppSpacing.sm),

              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: AppTypography.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  children: [
                    TextSpan(text: '${context.l10n.otpSentTo} '),
                    TextSpan(
                      text: vm.maskedPhone,
                      style: AppTypography.bodyMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 36),

              // ── OTP Boxes ─────────────────────────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => _OtpBox(
                  controller: _controllers[i],
                  focusNode: _focusNodes[i],
                  onChanged: (val) => _onDigitChanged(vm, i, val),
                  onBackspace: () {
                    if (_controllers[i].text.isEmpty && i > 0) {
                      vm.setDigit(i - 1, '');
                      _controllers[i - 1].clear();
                      _focusNodes[i - 1].requestFocus();
                    }
                  },
                  isFilled: vm.digits[i].isNotEmpty,
                )),
              ),

              const SizedBox(height: AppSpacing.sm),

              if (vm.errorMessage != null) ...[
                const SizedBox(height: AppSpacing.sm),
                Text(
                  vm.errorMessage!,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.error),
                  textAlign: TextAlign.center,
                ),
              ],

              const SizedBox(height: 28),

              // ── Verify Button ─────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: vm.isComplete && !vm.isLoading
                      ? () async {
                          final success = await vm.verifyOtp();
                          if (context.mounted && success) {
                            context.go('/home');
                          }
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: AppColors.sky200,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.buttonBorder,
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
                      : Text(
                          context.l10n.verify,
                          style: AppTypography.button,
                        ),
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),

              // ── Resend Row ────────────────────────────────────────────────
              Center(
                child: vm.canResend
                    ? TextButton(
                        onPressed: vm.resendOtp,
                        child: Text(
                          context.l10n.resendOtp,
                          style: AppTypography.subtitle.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      )
                    : Text(
                        context.l10n.resendIn(vm.timerDisplay),
                        style: AppTypography.bodySmall,
                      ),
              ),

              const SizedBox(height: 24),

              // ── Resend timer ──────────────────────────────────────────────
              vm.canResend
                  ? GestureDetector(
                      onTap: vm.resendOtp,
                      child: Text(
                        'Gửi lại mã',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    )
                  : RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        children: [
                          const TextSpan(text: 'Resend code in '),
                          TextSpan(
                            text: vm.timerDisplay,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),

              const SizedBox(height: 8),

              Text(
                "Chưa nhận được mã? Vui lòng kiểm tra hộp thư SMS.",
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary.withValues(alpha: 0.7),
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 32),

              Text(
                'HMS Patient Portal · v2.4.1',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary.withValues(alpha: 0.5),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Widget: Step indicator ────────────────────────────────────────────────────
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

// ── Widget: Single OTP box ────────────────────────────────────────────────────
class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;
  final VoidCallback onBackspace;
  final bool isFilled;

  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    required this.onBackspace,
    required this.isFilled,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 54,
      child: KeyboardListener(
        focusNode: FocusNode(),
        onKeyEvent: (event) {
          if (event is KeyDownEvent &&
              event.logicalKey == LogicalKeyboardKey.backspace) {
            onBackspace();
          }
        },
        child: TextFormField(
          controller: controller,
          focusNode: focusNode,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6), // Cho phép paste 6 số
          ],
          onChanged: onChanged,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            counterText: '',
            filled: true,
            fillColor: isFilled
                ? AppColors.sky100
                : AppColors.canvasColor,
            contentPadding: EdgeInsets.zero,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: isFilled ? AppColors.primary : AppColors.borderLight,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(
                color: isFilled ? AppColors.primary : AppColors.borderLight,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
      ),
    );
  }
}
