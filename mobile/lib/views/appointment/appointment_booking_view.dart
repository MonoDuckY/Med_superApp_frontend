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
      backgroundColor: Colors.white,
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
            const SizedBox(height: 32),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: vm.mode == BookingMode.byTime
                  ? const _ByTimeFlow()
                  : const _ByDoctorFlow(),
            ),
            const SizedBox(height: 24),
            const Divider(color: AppColors.borderLight, height: 1),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: double.infinity,
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
                    backgroundColor: AppColors.primary,
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
                            Icon(Icons.calendar_today, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Xác nhận đặt lịch',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Thông báo xác nhận sẽ được gửi sau khi bạn nhấn đặt lịch',
                style: TextStyle(fontSize: 11, color: AppColors.textHint),
              ),
            ],
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
        icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary, size: 24),
        onPressed: () => Navigator.of(context).pop(),
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Đặt lịch khám mới',
            style: GoogleFonts.inter(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            'Quản lý lịch khám',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(color: AppColors.borderLight, height: 1),
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
        color: AppColors.canvasColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceLight),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          Expanded(
            child: _Segment(
              title: 'Theo giờ',
              subtitle: 'Chọn khung giờ trước',
              isSelected: mode == BookingMode.byTime,
              onTap: () => onChanged(BookingMode.byTime),
            ),
          ),
          Expanded(
            child: _Segment(
              title: 'Theo bác sĩ',
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
          borderRadius: BorderRadius.circular(12),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2))]
              : [],
        ),
        child: Column(
          children: [
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isSelected ? AppColors.primary : AppColors.textHint,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            if (isSelected)
              Container(
                width: 24,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(2),
                ),
              )
            else
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.slate300,
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
        const SizedBox(height: 16),
        const _DateSelectorRow(byDoctorMode: false),
        const SizedBox(height: 32),

        _SectionTitle(number: '2', title: 'CHỌN KHUNG GIỜ'),
        const SizedBox(height: 16),
        if (vm.isLoadingSlotsByTime)
          const Center(child: CircularProgressIndicator())
        else if (vm.timeSlotsForSelectedDate.isEmpty)
          const Text('Không có ca khám nào.', style: TextStyle(color: Colors.grey))
        else
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: vm.timeSlotsForSelectedDate.map((slot) {
              final isSelected = vm.selectedTimeSlotByTime?.id == slot.id;
              return _TimeSlotChip(
                time: slot.time,
                availableCount: slot.availableDoctors,
                isSelected: isSelected,
                isAvailable: slot.isAvailable,
                onTap: () => vm.selectTimeSlotByTime(slot),
              );
            }).toList(),
          ),
        
        if (!vm.isLoadingSlotsByTime && vm.timeSlotsForSelectedDate.isNotEmpty)
          const Padding(
            padding: EdgeInsets.only(top: 16.0),
            child: _TimeLegend(),
          ),
        
        const SizedBox(height: 32),
        if (vm.selectedTimeSlotByTime != null) ...[
          _SectionTitle(
            number: '3', 
            title: 'BÁC SĨ SẴN SÀNG', 
            trailingText: '${vm.availableDoctorsForSelectedTime.length} bác sĩ'
          ),
          const SizedBox(height: 16),
          ...vm.availableDoctorsForSelectedTime.map((doc) => _DoctorCard(
                name: doc.name,
                specialty: doc.specialty,
                phoneNumber: doc.phoneNumber,
                avatarColor: doc.avatarColor,
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
        _SectionTitle(
          number: '1', 
          title: 'CHỌN BÁC SĨ',
          trailingText: '${vm.allDoctors.length} bác sĩ'
        ),
        const SizedBox(height: 16),
        if (vm.isLoadingDoctors)
          const Center(child: CircularProgressIndicator())
        else
          ...vm.allDoctors.map((doc) => _DoctorCard(
                name: doc.fullName,
                specialty: 'Khám bệnh', // Default mapping
                phoneNumber: doc.phoneNumber,
                avatarColor: AppColors.primary,
                isSelected: vm.selectedDoctorByDoctorMode?.id == doc.id,
                onTap: () => vm.selectDoctorByDoctorMode(doc),
              )),
        
        const SizedBox(height: 32),
        if (vm.selectedDoctorByDoctorMode != null) ...[
          _SectionTitle(number: '2', title: 'CHỌN NGÀY KHÁM'),
          const SizedBox(height: 16),
          if (vm.isLoadingSlotsByDoctor)
            const Center(child: CircularProgressIndicator())
          else
            const _DateSelectorRow(byDoctorMode: true),
          
          const SizedBox(height: 32),
          if (vm.selectedDate != null) ...[
            _SectionTitle(number: '3', title: 'CHỌN KHUNG GIỜ'),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: vm.timeSlotsForDoctorAndDate.map((slot) {
                final isSelected = vm.selectedTimeSlotByDoctor?.id == slot.id;
                return _TimeSlotChip(
                  time: slot.time,
                  availableCount: slot.availableDoctors,
                  isSelected: isSelected,
                  isAvailable: slot.isAvailable,
                  showAvailableCount: false,
                  onTap: () => vm.selectTimeSlotByDoctor(slot),
                );
              }).toList(),
            ),
            if (vm.timeSlotsForDoctorAndDate.isNotEmpty)
              const Padding(
                padding: EdgeInsets.only(top: 16.0),
                child: _TimeLegend(),
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
  final String? trailingText;

  const _SectionTitle({required this.number, required this.title, this.trailingText});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary,
          ),
          alignment: Alignment.center,
          child: Text(number, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
          ),
        ),
        if (trailingText != null) ...[
          const Spacer(),
          Text(
            trailingText!,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          )
        ]
      ],
    );
  }
}

class _DateSelectorRow extends StatelessWidget {
  final bool byDoctorMode;
  const _DateSelectorRow({required this.byDoctorMode});

  String _getWeekdayString(DateTime date) {
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return 'NAY';
    }
    switch (date.weekday) {
      case 1: return 'T2';
      case 2: return 'T3';
      case 3: return 'T4';
      case 4: return 'T5';
      case 5: return 'T6';
      case 6: return 'T7';
      case 7: return 'CN';
      default: return '';
    }
  }

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
              margin: const EdgeInsets.only(right: 12),
              width: 64,
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.borderLight,
                ),
              ),
              child: Column(
                children: [
                  Text(
                    _getWeekdayString(date),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${date.day}',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Th${date.month}',
                    style: TextStyle(
                      fontSize: 11,
                      color: isSelected ? Colors.white70 : AppColors.slate300,
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
  final int availableCount;
  final bool isSelected;
  final bool isAvailable;
  final bool showAvailableCount;
  final VoidCallback onTap;

  const _TimeSlotChip({
    required this.time,
    required this.availableCount,
    required this.isSelected,
    required this.isAvailable,
    this.showAvailableCount = true,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Calculate end time
    String endTimeStr = '';
    try {
      final parts = time.split(':');
      if (parts.length == 2) {
        final dt = DateTime(2020, 1, 1, int.parse(parts[0]), int.parse(parts[1]));
        final endDt = dt.add(const Duration(minutes: 30));
        endTimeStr = '${endDt.hour.toString().padLeft(2, '0')}:${endDt.minute.toString().padLeft(2, '0')}';
      }
    } catch (_) {}

    final timeRange = endTimeStr.isNotEmpty ? '$time - $endTimeStr' : time;

    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        width: (MediaQuery.of(context).size.width - 32 - 12) / 2, // 2 columns
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.borderLight,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.access_time, 
              size: 14, 
              color: isSelected ? Colors.white : (isAvailable ? AppColors.primary : AppColors.slate300)
            ),
            const SizedBox(width: 4),
            Expanded(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  timeRange,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: isSelected ? Colors.white : (isAvailable ? AppColors.textPrimary : AppColors.slate300),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 4),
            if (showAvailableCount) ...[
              if (isAvailable)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.white.withValues(alpha: 0.2) : AppColors.sky100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '$availableCount BS',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.primary,
                    ),
                  ),
                )
              else
                const Text(
                  'Đầy',
                  style: TextStyle(fontSize: 11, color: AppColors.slate300),
                )
            ] else if (!isAvailable) ...[
              const Text(
                'Đầy',
                style: TextStyle(fontSize: 11, color: AppColors.slate300),
              )
            ]
          ],
        ),
      ),
    );
  }
}

class _TimeLegend extends StatelessWidget {
  const _TimeLegend();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _buildLegendItem(AppColors.primary, 'Đã chọn'),
        const SizedBox(width: 16),
        _buildLegendItem(AppColors.slate300, 'Còn trống'),
        const SizedBox(width: 16),
        _buildLegendItem(AppColors.surfaceLight, 'Đã đầy'),
      ],
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
      ],
    );
  }
}

class _DoctorCard extends StatelessWidget {
  final String name;
  final String specialty;
  final String? phoneNumber;
  final Color avatarColor;
  final bool isSelected;
  final VoidCallback onTap;

  const _DoctorCard({
    required this.name,
    required this.specialty,
    this.phoneNumber,
    required this.avatarColor,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Determine theme color for selection. Let's use red if the avatar is red (e.g., NK -> Red)
    // To keep it simple, if it's selected we use a consistent color or the avatar's color.
    // For now we will use the avatarColor as the border color when selected.
    Color borderColor = isSelected ? avatarColor : AppColors.borderLight;
    
    // Fallback if avatarColor is too light, but normally it's fine.
    if (avatarColor == Colors.white || avatarColor == Colors.transparent) {
      borderColor = AppColors.error; 
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor, width: isSelected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: avatarColor,
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: Text(
                name.isNotEmpty ? name.split(' ').last[0].toUpperCase() : 'BS',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 4),
                  if (phoneNumber != null && phoneNumber!.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.phone, color: AppColors.textSecondary, size: 14),
                        const SizedBox(width: 4),
                        Text(phoneNumber!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 4),
                  ],
                  Text(specialty, style: const TextStyle(color: AppColors.textHint, fontSize: 12)),
                ],
              ),
            ),
            if (isSelected)
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: borderColor),
                ),
                child: Icon(Icons.check, color: borderColor, size: 16),
              )
            else
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.slate300),
                ),
              ),
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
        const Center(
          child: Text('THÔNG TIN BỔ SUNG', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.textHint)),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Lý do khám', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
            Text('(Tùy chọn)', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
          ],
        ),
        const SizedBox(height: 12),
        TextField(
          onChanged: vm.setReason,
          maxLines: 4,
          maxLength: 300,
          decoration: InputDecoration(
            hintText: 'Mô tả triệu chứng để bác sĩ chuẩn bị trước...',
            hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.borderLight),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.borderLight),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            counterText: '${vm.reason.length}/300',
            counterStyle: const TextStyle(color: AppColors.textHint, fontSize: 11),
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
    
    String timeStr = '';
    if (vm.mode == BookingMode.byTime && vm.selectedTimeSlotByTime != null) {
      timeStr = vm.selectedTimeSlotByTime!.time;
    } else if (vm.mode == BookingMode.byDoctor && vm.selectedTimeSlotByDoctor != null) {
      timeStr = vm.selectedTimeSlotByDoctor!.time;
    }
    
    // Add end time to summary
    if (timeStr.isNotEmpty) {
      try {
        final parts = timeStr.split(':');
        final dt = DateTime(2020, 1, 1, int.parse(parts[0]), int.parse(parts[1]));
        final endDt = dt.add(const Duration(minutes: 30));
        final endTimeStr = '${endDt.hour.toString().padLeft(2, '0')}:${endDt.minute.toString().padLeft(2, '0')}';
        timeStr = '$timeStr - $endTimeStr';
      } catch (_) {}
    }
        
    final docName = vm.mode == BookingMode.byTime
        ? vm.selectedDoctorByTime?.name ?? ''
        : vm.selectedDoctorByDoctorMode?.fullName ?? '';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.receipt_long, size: 16, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text('Tóm tắt lịch khám', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.green100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text('Chờ xác nhận', style: TextStyle(color: Color(0xFF16A34A), fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                _SummaryRow(icon: Icons.calendar_today, label: 'Ngày khám', value: dateStr),
                const SizedBox(height: 16),
                _SummaryRow(icon: Icons.access_time, label: 'Khung giờ', value: timeStr),
                const SizedBox(height: 16),
                _SummaryRow(icon: Icons.person_outline, label: 'Bác sĩ', value: docName),
                const SizedBox(height: 16),
                const _SummaryRow(icon: Icons.business, label: 'Phòng khám', value: 'Phòng N3'), // Hardcoded based on screenshot
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: const BoxDecoration(
              color: AppColors.yellow100,
              borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
            ),
            child: const Row(
              children: [
                Icon(Icons.notifications_active_outlined, size: 14, color: AppColors.amber600),
                SizedBox(width: 8),
                Expanded(child: Text('Thông báo sẽ được gửi qua SMS sau khi đặt lịch thành công.', style: TextStyle(fontSize: 11, color: AppColors.amber600))),
              ],
            ),
          )
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
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: AppColors.textHint, fontSize: 14)),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
      ],
    );
  }
}
