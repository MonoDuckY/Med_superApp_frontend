import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../../core/app_colors.dart';
import '../../../models/appointment_models.dart';
import '../../../view_models/appointment_viewmodel.dart';
import 'widgets/booking_stepper.dart';
import 'widgets/booking_summary_bar.dart';

/// Step 2: Choose a doctor from those available in the selected time slot.
class Step2DoctorSelectionView extends StatelessWidget {
  const Step2DoctorSelectionView({super.key});

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
                const BookingStepper(currentStep: 2),
                const SizedBox(height: 16),

                // ── Summary bar ───────────────────────────────────────────────
                BookingSummaryBar(
                  date: vm.summaryDate,
                  time: vm.summaryTime,
                  doctorName: vm.summaryDoctorName,
                ),
                const SizedBox(height: 24),

                // ── Section header ────────────────────────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Flexible(
                      child: Text(
                        'Bác sĩ sẵn sàng trong khung giờ này',
                        style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${vm.availableDoctors.length} bác sĩ',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Ngày ${vm.summaryDate} · Giờ ${vm.summaryTime}',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),

                // ── Doctor list ───────────────────────────────────────────────
                if (vm.isLoadingDoctors)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else
                  ...vm.availableDoctors.map(
                    (doctor) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _DoctorCard(
                        doctor: doctor,
                        isSelected: vm.selectedDoctor?.id == doctor.id,
                        slotTime: vm.summaryTime,
                        onSelect: () => vm.selectDoctor(doctor),
                      ),
                    ),
                  ),
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

// ── Doctor Card ────────────────────────────────────────────────────────────────

class _DoctorCard extends StatelessWidget {
  final DoctorModel doctor;
  final bool isSelected;
  final String slotTime;
  final VoidCallback onSelect;

  const _DoctorCard({
    required this.doctor,
    required this.isSelected,
    required this.slotTime,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final borderColor =
        isSelected ? AppColors.purple : AppColors.borderLight;
    final cardBg = isSelected ? AppColors.purpleSurface : Colors.white;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: isSelected ? 2 : 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Doctor info row ─────────────────────────────────────────────────
          Row(
            children: [
              // Avatar with optional checkmark badge
              Stack(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: doctor.avatarColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        doctor.initials,
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  if (isSelected)
                    Positioned(
                      top: -2,
                      right: -2,
                      child: Container(
                        width: 18,
                        height: 18,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.purple,
                        ),
                        child: const Icon(
                          Icons.check,
                          size: 11,
                          color: Colors.white,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              // Name + specialty + experience
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      doctor.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      doctor.specialty,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: doctor.specialtyColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.person_outline,
                            size: 13, color: Color(0xFF94A3B8)),
                        const SizedBox(width: 3),
                        Text(
                          '${doctor.experienceYears} năm kinh nghiệm',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(Icons.star,
                            size: 13, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 3),
                        Text(
                          '${doctor.rating} (${doctor.reviewCount})',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // ── Hospital + select button ────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 13, color: Color(0xFF94A3B8)),
                  const SizedBox(width: 4),
                  Text(
                    doctor.hospital,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              // Select / Đã chọn button
              GestureDetector(
                onTap: onSelect,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.purple : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color:
                          isSelected ? AppColors.purple : doctor.specialtyColor,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isSelected) ...[
                        const Icon(Icons.check,
                            size: 13, color: Colors.white),
                        const SizedBox(width: 4),
                      ],
                      Text(
                        isSelected ? 'Đã chọn' : 'Chọn',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isSelected
                              ? Colors.white
                              : doctor.specialtyColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // ── Availability badge ──────────────────────────────────────────────
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                'Còn lịch hẹn lúc $slotTime',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.success,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── CTA Button ─────────────────────────────────────────────────────────────────

class _CtaButton extends StatelessWidget {
  final AppointmentViewModel vm;

  const _CtaButton({required this.vm});

  @override
  Widget build(BuildContext context) {
    final enabled = vm.canProceedStep2;

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
          onPressed: enabled ? vm.goToStep3 : null,
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
            'Tiếp tục →',
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
