import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/app_colors.dart';
import '../../../models/appointment_models.dart';
import '../../../view_models/appointment_viewmodel.dart';
import 'widgets/booking_stepper.dart';
import 'widgets/booking_summary_bar.dart';

/// Step 3: Review booking summary, enter optional reason, and select payment.
class Step3PaymentView extends StatelessWidget {
  const Step3PaymentView({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Stepper ──────────────────────────────────────────────────
                const BookingStepper(currentStep: 3),
                const SizedBox(height: 16),

                // ── Summary bar ───────────────────────────────────────────────
                BookingSummaryBar(
                  date: vm.summaryDate,
                  time: vm.summaryTime,
                  doctorName: vm.summaryDoctorName,
                ),
                const SizedBox(height: 24),

                // ── Lý do khám ────────────────────────────────────────────────
                Text(
                  'Lý do khám (Tùy chọn)',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 10),
                _ReasonField(
                  value: vm.reason,
                  onChanged: vm.setReason,
                ),
                const SizedBox(height: 24),

                // ── Tóm tắt đặt lịch ─────────────────────────────────────────
                _BookingSummaryCard(vm: vm),
                const SizedBox(height: 24),

                // ── Phương thức thanh toán ────────────────────────────────────
                Row(
                  children: [
                    Text(
                      'Phương thức thanh toán',
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      ' *',
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        color: AppColors.error,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _PaymentGrid(
                  selected: vm.selectedPaymentMethod,
                  onSelect: vm.selectPaymentMethod,
                ),
                const SizedBox(height: 16),

                // ── Notice banners ────────────────────────────────────────────
                _NoticeBanner(
                  color: const Color(0xFFD1FAE5),
                  borderColor: const Color(0xFF6EE7B7),
                  icon: Icons.verified_user_outlined,
                  iconColor: AppColors.success,
                  text:
                      'Giao dịch được mã hóa SSL 256-bit. Tiền tạm ứng sẽ được hoàn lại nếu hủy trước 24 giờ.',
                ),
                const SizedBox(height: 10),
                _NoticeBanner(
                  color: const Color(0xFFFEF3C7),
                  borderColor: const Color(0xFFFCD34D),
                  icon: Icons.info_outline,
                  iconColor: AppColors.warning,
                  text:
                      'Lưu ý: Xác nhận lịch sẽ được gửi qua SMS và email đã đăng ký.',
                ),
              ],
            ),
          ),
        ),

        // ── CTA Button ────────────────────────────────────────────────────────
        _ConfirmButton(vm: vm),
      ],
    );
  }
}

// ── Reason field ───────────────────────────────────────────────────────────────

class _ReasonField extends StatefulWidget {
  final String value;
  final ValueChanged<String> onChanged;

  const _ReasonField({required this.value, required this.onChanged});

  @override
  State<_ReasonField> createState() => _ReasonFieldState();
}

class _ReasonFieldState extends State<_ReasonField> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      onChanged: widget.onChanged,
      maxLines: 4,
      maxLength: 300,
      inputFormatters: [LengthLimitingTextInputFormatter(300)],
      style: GoogleFonts.inter(fontSize: 14, color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText:
            'Mô tả triệu chứng hoặc lý do khám để bác sĩ chuẩn bị trước...',
        hintStyle: GoogleFonts.inter(
            fontSize: 13, color: AppColors.textHint),
        counterStyle:
            GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

// ── Booking summary card ───────────────────────────────────────────────────────

class _BookingSummaryCard extends StatelessWidget {
  final AppointmentViewModel vm;

  const _BookingSummaryCard({required this.vm});

  @override
  Widget build(BuildContext context) {
    final doctor = vm.selectedDoctor;
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Text(
              'TÓM TẮT ĐẶT LỊCH',
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
                letterSpacing: 0.6,
              ),
            ),
          ),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _SummaryRow('Bác sĩ', doctor?.name ?? '-'),
                const SizedBox(height: 10),
                _SummaryRow('Chuyên khoa', doctor?.specialty ?? '-'),
                const SizedBox(height: 10),
                _SummaryRow('Bệnh viện', doctor?.hospital ?? '-'),
                const SizedBox(height: 10),
                _SummaryRow('Ngày khám', vm.summaryDate),
                const SizedBox(height: 10),
                _SummaryRow('Giờ khám', vm.summaryTime),
                const SizedBox(height: 14),
                const Divider(height: 1, color: Color(0xFFE2E8F0)),
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.account_balance_wallet_outlined,
                            size: 16, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          'Tiền tạm ứng',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      AppointmentViewModel.formatCurrency(
                          doctor?.depositAmount ?? 0),
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;

  const _SummaryRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
              fontSize: 13, color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

// ── Payment method grid ────────────────────────────────────────────────────────

class _PaymentGrid extends StatelessWidget {
  final PaymentMethod? selected;
  final ValueChanged<PaymentMethod> onSelect;

  const _PaymentGrid({required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    final methods = PaymentMethod.values;
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.7,
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      children: methods
          .map((m) => _PaymentCard(
                method: m,
                isSelected: selected == m,
                onTap: () => onSelect(m),
              ))
          .toList(),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentMethod method;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentCard({
    required this.method,
    required this.isSelected,
    required this.onTap,
  });

  IconData get _icon {
    switch (method) {
      case PaymentMethod.qrCode:
        return Icons.qr_code_2;
      case PaymentMethod.momo:
        return Icons.smartphone;
      case PaymentMethod.bankTransfer:
        return Icons.account_balance_outlined;
      case PaymentMethod.visaMaster:
        return Icons.credit_card;
    }
  }

  Color get _accentColor {
    switch (method) {
      case PaymentMethod.momo:
        return AppColors.purple;
      case PaymentMethod.visaMaster:
        return AppColors.warning;
      case PaymentMethod.bankTransfer:
        return const Color(0xFF059669);
      case PaymentMethod.qrCode:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.purpleSurface : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.purple : AppColors.borderLight,
            width: isSelected ? 2 : 1,
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(_icon, size: 22, color: _accentColor),
            const SizedBox(height: 4),
            Text(
              method.label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              method.subtitle,
              style: GoogleFonts.inter(
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Notice banner ──────────────────────────────────────────────────────────────

class _NoticeBanner extends StatelessWidget {
  final Color color;
  final Color borderColor;
  final IconData icon;
  final Color iconColor;
  final String text;

  const _NoticeBanner({
    required this.color,
    required this.borderColor,
    required this.icon,
    required this.iconColor,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: borderColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: iconColor),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textPrimary,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Confirm CTA ────────────────────────────────────────────────────────────────

class _ConfirmButton extends StatelessWidget {
  final AppointmentViewModel vm;

  const _ConfirmButton({required this.vm});

  @override
  Widget build(BuildContext context) {
    final enabled = vm.canConfirm && !vm.isSubmitting;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(15),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton.icon(
          onPressed: enabled
              ? () async {
                  final ok = await vm.confirmBooking();
                  if (ok && context.mounted) {
                    context.go('/appointments');
                  }
                }
              : null,
          icon: vm.isSubmitting
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Colors.white),
                )
              : const Icon(Icons.credit_card, size: 18),
          label: Text(
            vm.isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor:
                enabled ? AppColors.primary : AppColors.borderLight,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 0,
          ),
        ),
      ),
    );
  }
}
