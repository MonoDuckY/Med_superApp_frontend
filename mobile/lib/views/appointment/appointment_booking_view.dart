import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../view_models/appointment_viewmodel.dart';
import 'appointment_success_view.dart';

class AppointmentBookingView extends StatelessWidget {
  const AppointmentBookingView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppointmentViewModel()..selectDateByTime(DateTime.now()),
      child: const _BookingScaffold(),
    );
  }
}

class _BookingScaffold extends StatelessWidget {
  const _BookingScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      appBar: _buildAppBar(context),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SegmentedControl(
              mode: vm.mode,
              onChanged: (mode) => vm.setMode(mode),
            ),
            const SizedBox(height: 24),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: vm.mode == BookingMode.byTime
                  ? const _ByTimeFlow()
                  : const _ByDoctorFlow(),
            ),
            const SizedBox(height: 24),
            const _AdditionalInfoSection(),
            const SizedBox(height: 16),
            const _SummaryCard(),
            const SizedBox(height: 32),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: ElevatedButton(
            onPressed: vm.canConfirm && !vm.isSubmitting
                ? () async {
                    final success = await vm.confirmBooking();
                    if (success && context.mounted) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => AppointmentSuccessView(
                            date: vm.selectedDate!,
                            time: vm.mode == BookingMode.byTime
                                ? vm.selectedTimeSlotByTime!.time
                                : vm.selectedTimeSlotByDoctor!.time,
                            doctorName: vm.mode == BookingMode.byTime
                                ? vm.selectedDoctorByTime!.name
                                : vm.selectedDoctorByDoctorMode!.fullName,
                          ),
                        ),
                      );
                    } else if (!success && vm.errorMessage != null && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(vm.errorMessage!)),
                      );
                    }
                  }
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0EA5E9),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: vm.isSubmitting
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.calendar_today, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Xác nhận đặt lịch',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 20),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Đặt lịch khám',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            'Hẹn khám trực tuyến',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(color: const Color(0xFFE2E8F0), height: 1),
      ),
    );
  }
}

// ── Shared UI Components ──────────────────────────────────────────────────

class _SegmentedControl extends StatelessWidget {
  final BookingMode mode;
  final ValueChanged<BookingMode> onChanged;

  const _SegmentedControl({required this.mode, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _Segment(
              title: 'Đặt theo giờ',
              subtitle: 'Chọn khung giờ trước',
              isSelected: mode == BookingMode.byTime,
              onTap: () => onChanged(BookingMode.byTime),
            ),
          ),
          Expanded(
            child: _Segment(
              title: 'Đặt theo bác sĩ',
              subtitle: 'Chọn bác sĩ trước',
              isSelected: mode == BookingMode.byDoctor,
              onTap: () => onChanged(BookingMode.byDoctor),
            ),
          ),
        ],
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _Segment({
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2))]
              : [],
        ),
        child: Column(
          children: [
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? const Color(0xFF0EA5E9) : AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 10,
                color: isSelected ? AppColors.textSecondary : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Tab 1: By Time Flow ───────────────────────────────────────────────────

class _ByTimeFlow extends StatelessWidget {
  const _ByTimeFlow();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionTitle(number: '1', title: 'CHỌN NGÀY KHÁM'),
        const SizedBox(height: 12),
        const _DateSelectorRow(byDoctorMode: false),
        const SizedBox(height: 24),

        _SectionTitle(number: '2', title: 'CHỌN KHUNG GIỜ'),
        const SizedBox(height: 12),
        if (vm.isLoadingSlotsByTime)
          const Center(child: CircularProgressIndicator())
        else if (vm.timeSlotsForSelectedDate.isEmpty)
          const Text('Không có ca khám nào.', style: TextStyle(color: Colors.grey))
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: vm.timeSlotsForSelectedDate.map((slot) {
              final isSelected = vm.selectedTimeSlotByTime?.id == slot.id;
              return _TimeSlotChip(
                time: slot.time,
                subtitle: '${slot.availableDoctors} BS',
                isSelected: isSelected,
                isAvailable: slot.isAvailable,
                onTap: () => vm.selectTimeSlotByTime(slot),
              );
            }).toList(),
          ),
        
        const SizedBox(height: 24),
        if (vm.selectedTimeSlotByTime != null) ...[
          _SectionTitle(number: '3', title: 'CHỌN BÁC SĨ'),
          const SizedBox(height: 12),
          ...vm.availableDoctorsForSelectedTime.map((doc) => _DoctorCard(
                name: doc.name,
                specialty: doc.specialty,
                rating: doc.rating,
                experience: doc.experienceYears,
                isSelected: vm.selectedDoctorByTime?.id == doc.id,
                onTap: () => vm.selectDoctorByTime(doc),
              )),
        ]
      ],
    );
  }
}

// ── Tab 2: By Doctor Flow ─────────────────────────────────────────────────

class _ByDoctorFlow extends StatelessWidget {
  const _ByDoctorFlow();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionTitle(number: '1', title: 'CHỌN BÁC SĨ'),
        const SizedBox(height: 12),
        if (vm.isLoadingDoctors)
          const Center(child: CircularProgressIndicator())
        else
          ...vm.allDoctors.map((doc) => _DoctorCard(
                name: doc.fullName,
                specialty: 'Khám bệnh', // Default mapping
                rating: 5.0,
                experience: 5,
                isSelected: vm.selectedDoctorByDoctorMode?.id == doc.id,
                onTap: () => vm.selectDoctorByDoctorMode(doc),
              )),
        
        const SizedBox(height: 24),
        if (vm.selectedDoctorByDoctorMode != null) ...[
          _SectionTitle(number: '2', title: 'CHỌN NGÀY KHÁM'),
          const SizedBox(height: 12),
          if (vm.isLoadingSlotsByDoctor)
            const Center(child: CircularProgressIndicator())
          else
            const _DateSelectorRow(byDoctorMode: true),
          
          const SizedBox(height: 24),
          if (vm.selectedDate != null) ...[
            _SectionTitle(number: '3', title: 'CHỌN GIỜ KHÁM'),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: vm.timeSlotsForDoctorAndDate.map((slot) {
                final isSelected = vm.selectedTimeSlotByDoctor?.id == slot.id;
                return _TimeSlotChip(
                  time: slot.time,
                  subtitle: '',
                  isSelected: isSelected,
                  isAvailable: slot.isAvailable,
                  onTap: () => vm.selectTimeSlotByDoctor(slot),
                );
              }).toList(),
            ),
          ]
        ]
      ],
    );
  }
}

// ── Reusable UI Pieces ────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final String number;
  final String title;

  const _SectionTitle({required this.number, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 20,
          height: 20,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF94A3B8)),
          ),
          alignment: Alignment.center,
          child: Text(number, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: Color(0xFF64748B),
          ),
        ),
      ],
    );
  }
}

class _DateSelectorRow extends StatelessWidget {
  final bool byDoctorMode;
  const _DateSelectorRow({required this.byDoctorMode});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();
    final today = DateTime.now();
    
    List<DateTime> datesToShow = [];
    if (byDoctorMode) {
      datesToShow = vm.availableDatesForSelectedDoctor;
    } else {
      // Show next 30 days for by-time mode
      for (int i = 0; i < 30; i++) {
        datesToShow.add(today.add(Duration(days: i)));
      }
    }

    if (datesToShow.isEmpty) {
      return const Text('Không có lịch trong thời gian tới.');
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: datesToShow.map((date) {
          final isSelected = vm.selectedDate != null &&
              vm.selectedDate!.year == date.year &&
              vm.selectedDate!.month == date.month &&
              vm.selectedDate!.day == date.day;
          
          return GestureDetector(
            onTap: () {
              if (byDoctorMode) {
                vm.selectDateByDoctor(date);
              } else {
                vm.selectDateByTime(date);
              }
            },
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              width: 56,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF0EA5E9) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? const Color(0xFF0EA5E9) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Column(
                children: [
                  Text(
                    'Th${date.month}', // Dummy month text
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? Colors.white70 : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${date.day}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _TimeSlotChip extends StatelessWidget {
  final String time;
  final String subtitle;
  final bool isSelected;
  final bool isAvailable;
  final VoidCallback onTap;

  const _TimeSlotChip({
    required this.time,
    required this.subtitle,
    required this.isSelected,
    required this.isAvailable,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        width: 80,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0EA5E9) : (isAvailable ? Colors.white : const Color(0xFFF8FAFC)),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF0EA5E9) : (isAvailable ? const Color(0xFFE2E8F0) : const Color(0xFFF1F5F9)),
          ),
        ),
        child: Column(
          children: [
            Text(
              time,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
                color: isSelected ? Colors.white : (isAvailable ? AppColors.textPrimary : const Color(0xFFCBD5E1)),
              ),
            ),
            if (subtitle.isNotEmpty)
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 10,
                  color: isSelected ? Colors.white70 : (isAvailable ? AppColors.textSecondary : const Color(0xFFCBD5E1)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _DoctorCard extends StatelessWidget {
  final String name;
  final String specialty;
  final double rating;
  final int experience;
  final bool isSelected;
  final VoidCallback onTap;

  const _DoctorCard({
    required this.name,
    required this.specialty,
    required this.rating,
    required this.experience,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFF0EA5E9) : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: const BoxDecoration(
                color: Color(0xFF0EA5E9),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                name.isNotEmpty ? name[0] : 'BS',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  Text(specialty, style: const TextStyle(color: Color(0xFF0EA5E9), fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 4),
                      Text('$rating · $experience năm', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Color(0xFF0EA5E9)),
          ],
        ),
      ),
    );
  }
}

class _AdditionalInfoSection extends StatelessWidget {
  const _AdditionalInfoSection();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('THÔNG TIN BỔ SUNG', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF94A3B8))),
        const SizedBox(height: 12),
        TextField(
          onChanged: vm.setReason,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: 'Mô tả triệu chứng hoặc lý do khám để bác sĩ chuẩn bị trước...',
            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF0EA5E9)),
            ),
          ),
        ),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();
    if (!vm.canConfirm) return const SizedBox.shrink();

    String dateStr = '';
    if (vm.selectedDate != null) {
      dateStr = '${vm.selectedDate!.day}/${vm.selectedDate!.month}/${vm.selectedDate!.year}';
    }
    
    final timeStr = vm.mode == BookingMode.byTime
        ? vm.selectedTimeSlotByTime?.time ?? ''
        : vm.selectedTimeSlotByDoctor?.time ?? '';
        
    final docName = vm.mode == BookingMode.byTime
        ? vm.selectedDoctorByTime?.name ?? ''
        : vm.selectedDoctorByDoctorMode?.fullName ?? '';

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Tóm tắt lịch hẹn', style: TextStyle(fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: const Text('Chờ xác nhận', style: TextStyle(color: Color(0xFF16A34A), fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _SummaryRow(icon: Icons.calendar_today, label: 'Ngày khám', value: dateStr),
          const SizedBox(height: 12),
          _SummaryRow(icon: Icons.access_time, label: 'Giờ khám', value: timeStr),
          const SizedBox(height: 12),
          _SummaryRow(icon: Icons.person_outline, label: 'Bác sĩ', value: docName),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _SummaryRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 8),
        Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }
}
