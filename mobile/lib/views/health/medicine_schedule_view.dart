import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../core/app_colors.dart';
import '../../models/dto/medicine_schedule_response.dart';
import '../../view_models/medicine_schedule_viewmodel.dart';

/// UC-10 — Màn hình lịch uống thuốc (Full-screen)
class MedicineScheduleView extends StatelessWidget {
  const MedicineScheduleView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Consumer<MedicineScheduleViewModel>(
          builder: (context, vm, _) {
            return Column(
              children: [
                _MedHeader(),
                Expanded(
                  child: vm.isLoading
                      ? const _LoadingState()
                      : vm.errorMessage != null
                          ? _ErrorState(message: vm.errorMessage!, onRetry: vm.refresh)
                          : _ScheduleContent(vm: vm),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _MedHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 20, 12),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                  color: AppColors.textPrimary,
                ),
                const SizedBox(width: 4),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chăm sóc bản thân',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        'Lịch uống thuốc',
                        style: GoogleFonts.inter(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [AppColors.primary, AppColors.teal],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.medication_rounded, color: Colors.white, size: 22),
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

// ── Main Content ──────────────────────────────────────────────────────────────

class _ScheduleContent extends StatelessWidget {
  final MedicineScheduleViewModel vm;
  const _ScheduleContent({required this.vm});

  @override
  Widget build(BuildContext context) {
    final schedules = vm.schedulesForSelectedDate;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: vm.refresh,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              child: _TodaySummaryBanner(vm: vm),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
              child: _DateFilterBar(vm: vm),
            ),
          ),
          if (schedules.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: _EmptyDateState(date: vm.selectedDate),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _ScheduleCard(
                      schedule: schedules[index],
                      onMarkTaken: () => _handleMarkTaken(context, vm, schedules[index]),
                      onReschedule: () => _handleReschedule(context, vm, schedules[index]),
                    ),
                  ),
                  childCount: schedules.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Future<void> _handleMarkTaken(
    BuildContext context,
    MedicineScheduleViewModel vm,
    MedicineScheduleResponse schedule,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          'Xác nhận đã uống',
          style: GoogleFonts.inter(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        content: Text(
          'Bạn đã uống ${schedule.medicineName} (${schedule.dosage})?',
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Hủy', style: GoogleFonts.inter(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.success,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Đã uống',
                style: GoogleFonts.inter(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await vm.markTaken(schedule.id);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.success,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          content: Row(children: [
            const Icon(Icons.check_circle, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text('Đã đánh dấu uống ${schedule.medicineName}',
                style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
          ]),
        ));
      }
    }
  }

  Future<void> _handleReschedule(
    BuildContext context,
    MedicineScheduleViewModel vm,
    MedicineScheduleResponse schedule,
  ) async {
    final result = await showModalBottomSheet<DateTime>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _RescheduleBottomSheet(schedule: schedule),
    );

    if (result != null && context.mounted) {
      final error = await vm.updateScheduleTime(schedule.id, result);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: error != null ? AppColors.error : AppColors.primary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          content: Text(error ?? 'Đã cập nhật giờ uống',
              style: GoogleFonts.inter(color: Colors.white, fontSize: 13)),
        ));
      }
    }
  }
}

// ── Today Summary Banner ──────────────────────────────────────────────────────

class _TodaySummaryBanner extends StatelessWidget {
  final MedicineScheduleViewModel vm;
  const _TodaySummaryBanner({required this.vm});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.darkBlue],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withAlpha(60),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hôm nay',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: Colors.white.withAlpha(200),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 8,
                  children: [
                    _StatChip(
                      value: '${vm.todayTaken}/${vm.todayTotal}',
                      label: 'Đã uống',
                      icon: Icons.check_circle_outline_rounded,
                      color: AppColors.success,
                    ),
                    if (vm.todayRemaining > 0)
                      _StatChip(
                        value: '${vm.todayRemaining}',
                        label: 'Còn lại',
                        icon: Icons.alarm_outlined,
                        color: Colors.white,
                      ),
                    if (vm.todayOverdue > 0)
                      _StatChip(
                        value: '${vm.todayOverdue}',
                        label: 'Quá giờ',
                        icon: Icons.warning_amber_rounded,
                        color: AppColors.amber400,
                      ),
                  ],
                ),
              ],
            ),
          ),
          Icon(Icons.medication_rounded, size: 56, color: Colors.white.withAlpha(50)),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  const _StatChip({required this.value, required this.label, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(25),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.white.withAlpha(50)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value,
                  style: GoogleFonts.inter(
                      fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
              Text(label,
                  style: GoogleFonts.inter(fontSize: 9, color: Colors.white.withAlpha(200))),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Date Filter Bar ───────────────────────────────────────────────────────────

class _DateFilterBar extends StatelessWidget {
  final MedicineScheduleViewModel vm;
  const _DateFilterBar({required this.vm});

  @override
  Widget build(BuildContext context) {
    final dates = vm.availableDates;
    final selected = vm.selectedDate;
    final today = DateTime.now();
    final todayNorm = DateTime(today.year, today.month, today.day);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
          child: Text(
            'CHỌN NGÀY',
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
              letterSpacing: 0.6,
            ),
          ),
        ),
        SizedBox(
          height: 76,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: dates.length,
            itemBuilder: (context, index) {
              final date = dates[index];
              final isSelected = date.year == selected.year &&
                  date.month == selected.month &&
                  date.day == selected.day;
              final isToday = date.year == todayNorm.year &&
                  date.month == todayNorm.month &&
                  date.day == todayNorm.day;
              return _DateChip(
                date: date,
                isSelected: isSelected,
                isToday: isToday,
                onTap: () => vm.selectDate(date),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _DateChip extends StatelessWidget {
  final DateTime date;
  final bool isSelected;
  final bool isToday;
  final VoidCallback onTap;
  const _DateChip({required this.date, required this.isSelected, required this.isToday, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final weekday = _weekdayShort(date.weekday);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        width: 54,
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [AppColors.primary, AppColors.teal],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                )
              : null,
          color: isSelected ? null : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? Colors.transparent : isToday ? AppColors.primary : AppColors.borderLight,
            width: isToday && !isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [BoxShadow(color: AppColors.primary.withAlpha(60), blurRadius: 8, offset: const Offset(0, 3))]
              : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(weekday,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                  color: isSelected ? Colors.white.withAlpha(200) : AppColors.textSecondary,
                )),
            const SizedBox(height: 4),
            Text('${date.day}',
                style: GoogleFonts.inter(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: isSelected ? Colors.white : AppColors.textPrimary,
                )),
            Text('Th.${date.month}',
                style: GoogleFonts.inter(
                  fontSize: 9,
                  color: isSelected ? Colors.white.withAlpha(180) : AppColors.textHint,
                )),
          ],
        ),
      ),
    );
  }

  String _weekdayShort(int weekday) {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    return days[(weekday - 1) % 7];
  }
}

// ── Schedule Card (REDESIGNED) ────────────────────────────────────────────────
//
// Layout mới:
//   ┌──────────────────────────────────────────────┐
//   │  ┌─────────┐  Tên thuốc          [badge]     │
//   │  │  07:00  │  Liều lượng                     │
//   │  └─────────┘  ℹ Ghi chú                      │
//   │               [✓ Đã uống]  [⏱ Đổi giờ]     │
//   └──────────────────────────────────────────────┘
//
// Giờ & status badge tách ra:
//   - Giờ nằm trong pill riêng, tự co giãn theo nội dung → không bao giờ xuống dòng
//   - Badge nằm góc phải cùng hàng tên thuốc → đủ chỗ hiển thị đầy đủ text

class _ScheduleCard extends StatelessWidget {
  final MedicineScheduleResponse schedule;
  final VoidCallback onMarkTaken;
  final VoidCallback onReschedule;

  const _ScheduleCard({
    required this.schedule,
    required this.onMarkTaken,
    required this.onReschedule,
  });

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('HH:mm').format(schedule.scheduledAt);
    final statusColor = schedule.statusColor;
    final isDone = schedule.status == MedicineScheduleStatus.taken ||
        schedule.status == MedicineScheduleStatus.missed;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDone ? AppColors.borderLight : statusColor.withAlpha(60),
          width: isDone ? 1 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: isDone ? Colors.black.withAlpha(6) : statusColor.withAlpha(18),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Cột trái: Time pill ──────────────────────────────────────────
            _TimePill(timeStr: timeStr, color: statusColor, isDone: isDone),
            const SizedBox(width: 12),

            // ── Cột phải: Nội dung ───────────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hàng 1: Tên thuốc + badge status (cùng hàng, badge bên phải)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          schedule.medicineName,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: isDone ? AppColors.textSecondary : AppColors.textPrimary,
                            decoration: schedule.status == MedicineScheduleStatus.missed
                                ? TextDecoration.lineThrough
                                : null,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Status badge — full text, không bị truncate
                      _StatusBadge(schedule: schedule),
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Hàng 2: Liều lượng
                  Row(
                    children: [
                      Icon(Icons.medication_outlined, size: 12,
                          color: statusColor.withAlpha(isDone ? 100 : 180)),
                      const SizedBox(width: 4),
                      Text(
                        schedule.dosage,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),

                  // Hàng 3: Ghi chú (nếu có)
                  if (schedule.note != null) ...[
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Icon(Icons.info_outline_rounded, size: 11, color: AppColors.textHint),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            schedule.note!,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textHint,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  // Hàng 4: Action buttons (chỉ khi isActionable)
                  if (schedule.isActionable) ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 34,
                            child: ElevatedButton.icon(
                              onPressed: onMarkTaken,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.success,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8)),
                                padding: EdgeInsets.zero,
                                elevation: 0,
                              ),
                              icon: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
                              label: Text('Đã uống',
                                  style: GoogleFonts.inter(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          height: 34,
                          child: OutlinedButton.icon(
                            onPressed: onReschedule,
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: AppColors.primary.withAlpha(100)),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8)),
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                            ),
                            icon: Icon(Icons.schedule_rounded, size: 14, color: AppColors.primary),
                            label: Text('Đổi giờ',
                                style: GoogleFonts.inter(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Time Pill ─────────────────────────────────────────────────────────────────
// Pill hình tròn chứa giờ — tự co giãn theo nội dung, không bao giờ xuống dòng

class _TimePill extends StatelessWidget {
  final String timeStr;
  final Color color;
  final bool isDone;
  const _TimePill({required this.timeStr, required this.color, required this.isDone});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isDone ? AppColors.surfaceLight : color.withAlpha(15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDone ? AppColors.borderLight : color.withAlpha(50),
        ),
      ),
      child: Text(
        timeStr,
        style: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.w800,
          color: isDone ? AppColors.textSecondary : color,
          letterSpacing: 0.5,
          // Đảm bảo không bao giờ xuống dòng
          height: 1,
        ),
      ),
    );
  }
}

// ── Status Badge ──────────────────────────────────────────────────────────────
// Badge nhỏ gọn, text không bị truncate vì nằm ở góc phải có đủ chỗ

class _StatusBadge extends StatelessWidget {
  final MedicineScheduleResponse schedule;
  const _StatusBadge({required this.schedule});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: schedule.statusColor.withAlpha(15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: schedule.statusColor.withAlpha(60)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(schedule.statusIcon, size: 10, color: schedule.statusColor),
          const SizedBox(width: 4),
          Text(
            schedule.displayLabel,
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: schedule.statusColor,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Reschedule Bottom Sheet ───────────────────────────────────────────────────

class _RescheduleBottomSheet extends StatefulWidget {
  final MedicineScheduleResponse schedule;
  const _RescheduleBottomSheet({required this.schedule});

  @override
  State<_RescheduleBottomSheet> createState() => _RescheduleBottomSheetState();
}

class _RescheduleBottomSheetState extends State<_RescheduleBottomSheet> {
  late DateTime _selectedDateTime;

  @override
  void initState() {
    super.initState();
    _selectedDateTime = DateTime.now().add(const Duration(minutes: 30));
  }

  @override
  Widget build(BuildContext context) {
    final timeStr = DateFormat('HH:mm — dd/MM/yyyy').format(_selectedDateTime);
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.borderLight,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text('Đổi giờ uống thuốc',
              style: GoogleFonts.inter(
                  fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text('${widget.schedule.medicineName} — ${widget.schedule.dosage}',
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.canvasColor,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(20),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.schedule_rounded, size: 20, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Giờ mới đã chọn',
                        style: GoogleFonts.inter(fontSize: 11, color: AppColors.textSecondary)),
                    const SizedBox(height: 2),
                    Text(timeStr,
                        style: GoogleFonts.inter(
                            fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: OutlinedButton.icon(
              onPressed: _pickDateTime,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.borderLight),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              icon: Icon(Icons.edit_calendar_rounded, size: 18, color: AppColors.textSecondary),
              label: Text('Chọn ngày & giờ',
                  style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary)),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context, _selectedDateTime),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text('Xác nhận đổi giờ',
                  style: GoogleFonts.inter(
                      fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDateTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDateTime),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (time == null || !mounted) return;

    setState(() {
      _selectedDateTime = DateTime(
          date.year, date.month, date.day, time.hour, time.minute);
    });
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyDateState extends StatelessWidget {
  final DateTime date;
  const _EmptyDateState({required this.date});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.medication_outlined, size: 36, color: AppColors.textHint),
          ),
          const SizedBox(height: 16),
          Text('Không có lịch uống thuốc',
              style: GoogleFonts.inter(
                  fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Text(
            'Ngày ${DateFormat('dd/MM/yyyy').format(date)}\nkhông có lịch nào được đặt.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
          ),
        ],
      ),
    );
  }
}

// ── Loading & Error States ────────────────────────────────────────────────────

class _LoadingState extends StatelessWidget {
  const _LoadingState();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textHint),
            const SizedBox(height: 16),
            Text(message,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary)),
            const SizedBox(height: 20),
            ElevatedButton(onPressed: onRetry, child: const Text('Thử lại')),
          ],
        ),
      ),
    );
  }
}
