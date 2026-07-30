import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/app_colors.dart';
import '../../../models/appointment_models.dart';
import '../../../view_models/appointment_viewmodel.dart';
import '../shared/app_calendar.dart';
import 'widgets/booking_stepper.dart';
import 'widgets/booking_summary_bar.dart';

/// Step 1: Choose date and time slot.
class Step1TimeSelectionView extends StatelessWidget {
  const Step1TimeSelectionView({super.key});

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
                const BookingStepper(currentStep: 1),
                const SizedBox(height: 16),

                // ── Summary bar ───────────────────────────────────────────────
                BookingSummaryBar(
                  date: vm.summaryDate,
                  time: vm.summaryTime,
                ),
                const SizedBox(height: 24),

                // ── Calendar ──────────────────────────────────────────────────
                Text(
                  'Chọn ngày khám',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                AppCalendar(
                  focusedMonth: vm.focusedMonth,
                  selectedDate: vm.selectedDate,
                  onDateSelected: (date) => vm.selectDate(date),
                  onPreviousMonth: vm.previousMonth,
                  onNextMonth: vm.nextMonth,
                  disablePast: true,
                ),
                const SizedBox(height: 24),

                // ── Time slots ────────────────────────────────────────────────
                if (vm.isLoadingSlots)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (vm.timeSlots.isNotEmpty) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Chọn khung giờ',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${vm.timeSlots.where((s) => s.isAvailable).length} slot còn trống',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _TimeSlotGrid(
                    slots: vm.timeSlots,
                    selectedSlot: vm.selectedSlot,
                    onSlotTap: (slot) => vm.selectSlot(slot),
                  ),
                  const SizedBox(height: 14),
                  _Legend(),
                ] else if (vm.selectedDate != null) ...[
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        'Không có khung giờ trống cho ngày này.',
                        style: GoogleFonts.inter(color: AppColors.textSecondary),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),

        // ── CTA Button ────────────────────────────────────────────────────────
        _CtaButton(vm: vm),
      ],
    );
  }
}

// ── Time Slot Grid ─────────────────────────────────────────────────────────────

class _TimeSlotGrid extends StatelessWidget {
  final List<TimeSlot> slots;
  final TimeSlot? selectedSlot;
  final ValueChanged<TimeSlot> onSlotTap;

  const _TimeSlotGrid({
    required this.slots,
    required this.selectedSlot,
    required this.onSlotTap,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: slots.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 1.5,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemBuilder: (context, i) {
        final slot = slots[i];
        return _TimeSlotCell(
          slot: slot,
          isSelected: selectedSlot?.id == slot.id,
          onTap: () => onSlotTap(slot),
        );
      },
    );
  }
}

class _TimeSlotCell extends StatelessWidget {
  final TimeSlot slot;
  final bool isSelected;
  final VoidCallback onTap;

  const _TimeSlotCell({
    required this.slot,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool available = slot.isAvailable;

    Color bg, borderColor, timeColor, subColor;

    if (isSelected) {
      bg = AppColors.slotSelected;
      borderColor = AppColors.slotSelected;
      timeColor = Colors.white;
      subColor = Colors.white;
    } else if (!available) {
      bg = AppColors.surfaceLight;
      borderColor = AppColors.borderLight;
      timeColor = AppColors.textHint;
      subColor = AppColors.textHint;
    } else {
      bg = Colors.white;
      borderColor = AppColors.borderLight;
      timeColor = AppColors.textPrimary;
      subColor = AppColors.textSecondary;
    }

    return GestureDetector(
      onTap: available ? onTap : null,
      child: Container(
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: borderColor),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              slot.time,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: timeColor,
                decoration: !available && !isSelected
                    ? TextDecoration.lineThrough
                    : null,
                decorationColor: AppColors.textHint,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              available ? '${slot.availableDoctors} BS' : 'Hết chỗ',
              style: GoogleFonts.inter(
                fontSize: 10,
                color: subColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Legend ─────────────────────────────────────────────────────────────────────

class _Legend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _LegendItem(
          color: AppColors.slotSelected,
          label: 'Đã chọn',
          filled: true,
        ),
        const SizedBox(width: 16),
        _LegendItem(
          color: AppColors.primary,
          label: 'Còn trống',
          filled: false,
        ),
        const SizedBox(width: 16),
        _LegendItem(
          color: AppColors.textHint,
          label: 'Hết chỗ',
          filled: false,
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final bool filled;

  const _LegendItem({
    required this.color,
    required this.label,
    required this.filled,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: filled ? color : Colors.transparent,
            border: Border.all(color: color, width: 1.5),
          ),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary),
        ),
      ],
    );
  }
}

// ── CTA Button ─────────────────────────────────────────────────────────────────

class _CtaButton extends StatelessWidget {
  final AppointmentViewModel vm;

  const _CtaButton({required this.vm});

  @override
  Widget build(BuildContext context) {
    final slot = vm.selectedSlot;
    final enabled = vm.canProceedStep1;
    final doctorCount = slot?.availableDoctors ?? 0;

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
        child: ElevatedButton(
          onPressed: enabled ? () => vm.goToStep2() : null,
          style: ElevatedButton.styleFrom(
            backgroundColor:
                enabled ? AppColors.primary : AppColors.borderLight,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 0,
          ),
          child: Text(
            enabled
                ? 'Xem $doctorCount bác sĩ sẵn sàng →'
                : 'Chọn ngày và khung giờ',
            style: GoogleFonts.inter(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: enabled ? Colors.white : AppColors.textHint,
            ),
          ),
        ),
      ),
    );
  }
}
