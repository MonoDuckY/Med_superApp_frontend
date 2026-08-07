import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/app_colors.dart';

/// Reusable calendar widget used in both:
/// - Step 1 of booking (disablePast: true, no markedDays)
/// - Appointments list screen (markedDays provided for dot indicators)
class AppCalendar extends StatelessWidget {
  final DateTime focusedMonth;
  final DateTime? selectedDate;
  final ValueChanged<DateTime> onDateSelected;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  /// Days (1-based) in focusedMonth that have appointments → show a blue dot.
  final Set<int>? markedDays;

  /// Optional subtitle below the month/year title (e.g. "4 lịch hẹn").
  final String? subtitle;

  /// When true, dates before today are grayed out and non-tappable.
  final bool disablePast;

  const AppCalendar({
    super.key,
    required this.focusedMonth,
    required this.selectedDate,
    required this.onDateSelected,
    required this.onPreviousMonth,
    required this.onNextMonth,
    this.markedDays,
    this.subtitle,
    this.disablePast = false,
  });

  static const List<String> _dayHeaders = [
    'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'
  ];

  static String _monthLabel(int month) {
    const names = [
      '', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return names[month];
  }

  @override
  Widget build(BuildContext context) {
    final firstDay = DateTime(focusedMonth.year, focusedMonth.month, 1);
    // weekday: 1=Mon..7=Sun → offset from Monday = weekday - 1
    final startOffset = firstDay.weekday - 1;
    final daysInMonth =
        DateUtils.getDaysInMonth(focusedMonth.year, focusedMonth.month);
    final today = DateTime.now();
    final todayNormalized = DateTime(today.year, today.month, today.day);

    // Build flat list of cells (empty padding + day cells)
    final cells = <Widget>[
      for (var i = 0; i < startOffset; i++) const SizedBox.shrink(),
      for (var day = 1; day <= daysInMonth; day++)
        _buildDayCell(
          day: day,
          date: DateTime(focusedMonth.year, focusedMonth.month, day),
          todayNormalized: todayNormalized,
        ),
    ];

    // Group into rows of 7
    final rows = <Widget>[];
    for (var i = 0; i < cells.length; i += 7) {
      final end = (i + 7).clamp(0, cells.length);
      final rowCells = List<Widget>.from(cells.sublist(i, end));
      while (rowCells.length < 7) { rowCells.add(const SizedBox.shrink()); }
      rows.add(Row(
        children: rowCells.map((c) => Expanded(child: c)).toList(),
      ));
      if (end < cells.length) rows.add(const SizedBox(height: 2));
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(13),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // ── Header row ─────────────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _NavButton(onTap: onPreviousMonth, icon: Icons.chevron_left),
              Column(
                children: [
                  Text(
                    '${_monthLabel(focusedMonth.month)}, ${focusedMonth.year}',
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
              _NavButton(onTap: onNextMonth, icon: Icons.chevron_right),
            ],
          ),
          const SizedBox(height: 14),
          // ── Day-of-week headers ────────────────────────────────────────────
          Row(
            children: _dayHeaders
                .map((label) => Expanded(
                      child: Center(
                        child: Text(
                          label,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: label == 'CN'
                                ? AppColors.error
                                : AppColors.textHint,
                          ),
                        ),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 8),
          // ── Calendar grid ──────────────────────────────────────────────────
          ...rows,
        ],
      ),
    );
  }

  Widget _buildDayCell({
    required int day,
    required DateTime date,
    required DateTime todayNormalized,
  }) {
    final isSelected = selectedDate != null &&
        selectedDate!.year == date.year &&
        selectedDate!.month == date.month &&
        selectedDate!.day == date.day;
    final isSunday = date.weekday == DateTime.sunday;
    final isPast = disablePast && date.isBefore(todayNormalized);
    final hasAppointment = markedDays?.contains(day) ?? false;

    Color textColor;
    if (isSelected) {
      textColor = Colors.white;
    } else if (isPast) {
      textColor = AppColors.borderLight;
    } else if (isSunday) {
      textColor = AppColors.error;
    } else {
      textColor = AppColors.textPrimary;
    }

    return GestureDetector(
      onTap: isPast ? null : () => onDateSelected(date),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        height: 44,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: isSelected
                  ? const BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                    )
                  : null,
              child: Center(
                child: Text(
                  '$day',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight:
                        isSelected ? FontWeight.bold : FontWeight.normal,
                    color: textColor,
                  ),
                ),
              ),
            ),
            // Appointment dot (hidden when date is selected)
            SizedBox(
              height: 6,
              child: hasAppointment && !isSelected
                  ? Center(
                      child: Container(
                        width: 5,
                        height: 5,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final VoidCallback onTap;
  final IconData icon;

  const _NavButton({required this.onTap, required this.icon});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.borderLight),
          color: Colors.white,
        ),
        child: Icon(icon, size: 18, color: AppColors.textSecondary),
      ),
    );
  }
}
