import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../models/appointment_models.dart';
import '../../view_models/appointments_list_viewmodel.dart';
import '../shared/app_calendar.dart';

/// Screen 4: Appointments list with calendar and per-day appointment cards.
class AppointmentsListView extends StatelessWidget {
  const AppointmentsListView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppointmentsListViewModel()..loadAppointments(),
      child: const _AppointmentsListScaffold(),
    );
  }
}

class _AppointmentsListScaffold extends StatelessWidget {
  const _AppointmentsListScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentsListViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: vm.isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  // ── Header ──────────────────────────────────────────────────
                  _ListHeader(),
                  // ── Scrollable body ─────────────────────────────────────────
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),
                          // Calendar
                          AppCalendar(
                            focusedMonth: vm.focusedMonth,
                            selectedDate: vm.selectedDate,
                            onDateSelected: vm.selectDate,
                            onPreviousMonth: vm.previousMonth,
                            onNextMonth: vm.nextMonth,
                            markedDays: vm.markedDays,
                            subtitle: '${vm.totalAppointmentsThisMonth} lịch hẹn',
                          ),
                          const SizedBox(height: 24),

                          // Selected date appointments
                          _AppointmentDateSection(vm: vm),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
      // ── FAB ────────────────────────────────────────────────────────────────
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push('/schedule/book');
        },
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        icon: const Icon(Icons.add, size: 20),
        label: Text(
          'Đặt lịch mới',
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// ── Header ─────────────────────────────────────────────────────────────────────

class _ListHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Consumer<AppointmentsListViewModel>(
                  builder: (context, vm, _) => Text(
                    vm.userName, 
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Lịch khám',
                  style: GoogleFonts.inter(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
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

// ── Appointment date section ───────────────────────────────────────────────────

class _AppointmentDateSection extends StatelessWidget {
  final AppointmentsListViewModel vm;

  const _AppointmentDateSection({required this.vm});

  String _formatSelectedDate(DateTime date) {
    const months = [
      '', 'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4',
      'tháng 5', 'tháng 6', 'tháng 7', 'tháng 8',
      'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
    ];
    return '${date.day} ${months[date.month]}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final appointments = vm.appointmentsForSelectedDate;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section header: "Lịch khám ngày [date] — X lịch hẹn"
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: RichText(
                text: TextSpan(
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                  children: [
                    const TextSpan(text: 'Lịch khám ngày '),
                    TextSpan(
                      text: _formatSelectedDate(vm.selectedDate),
                      style: const TextStyle(color: AppColors.primary),
                    ),
                  ],
                ),
              ),
            ),
            if (appointments.isNotEmpty)
              Text(
                '${appointments.length} lịch hẹn',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),

        // Appointment cards or empty state
        if (appointments.isEmpty)
          _EmptyAppointments()
        else
          ...appointments.map(
            (record) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _AppointmentCard(record: record),
            ),
          ),
      ],
    );
  }
}

// ── Empty state ────────────────────────────────────────────────────────────────

class _EmptyAppointments extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          const Icon(Icons.calendar_today_outlined,
              size: 40, color: AppColors.slate300),
          const SizedBox(height: 12),
          Text(
            'Không có lịch khám',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Bạn chưa có lịch hẹn nào trong ngày này.',
            style: GoogleFonts.inter(
              fontSize: 12,
              color: AppColors.textHint,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Appointment Card ───────────────────────────────────────────────────────────

class _AppointmentCard extends StatelessWidget {
  final AppointmentRecord record;

  const _AppointmentCard({required this.record});

  Color get _statusBg {
    switch (record.status) {
      case AppointmentStatus.pending:
        return AppColors.amber100;
      case AppointmentStatus.confirmed:
        return AppColors.emerald100;
      case AppointmentStatus.completed:
        return const Color(0xFFEFF6FF);
      case AppointmentStatus.cancelled:
        return AppColors.red100;
    }
  }

  Color get _statusColor {
    switch (record.status) {
      case AppointmentStatus.pending:
        return AppColors.warning;
      case AppointmentStatus.confirmed:
        return AppColors.success;
      case AppointmentStatus.completed:
        return AppColors.primary;
      case AppointmentStatus.cancelled:
        return AppColors.error;
    }
  }

  IconData get _statusIcon {
    switch (record.status) {
      case AppointmentStatus.pending:
        return Icons.schedule;
      case AppointmentStatus.confirmed:
        return Icons.check_circle_outline;
      case AppointmentStatus.completed:
        return Icons.task_alt;
      case AppointmentStatus.cancelled:
        return Icons.cancel_outlined;
    }
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  void _showCancelDialog(BuildContext context, AppointmentRecord record) {
    final vm = context.read<AppointmentsListViewModel>();
    final reasonController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Hủy lịch khám', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Vui lòng nhập lý do hủy lịch:'),
              const SizedBox(height: 12),
              TextField(
                controller: reasonController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Nhập lý do...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Đóng'),
            ),
            ElevatedButton(
              onPressed: () {
                final reason = reasonController.text.trim();
                if (reason.isNotEmpty) {
                  Navigator.pop(ctx);
                  vm.cancelAppointment(record.id, reason, context);
                } else {
                  ScaffoldMessenger.of(ctx).showSnackBar(
                    const SnackBar(content: Text('Vui lòng nhập lý do hủy lịch')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
              child: const Text('Xác nhận hủy', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  void _showAppointmentDetails(BuildContext context, AppointmentRecord record) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final date = record.dateTime;
        final timeStr =
            '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
            
        Color statusColor;
        Color statusBgColor;
        
        switch (record.status) {
          case AppointmentStatus.confirmed:
            statusColor = const Color(0xFF16A34A);
            statusBgColor = AppColors.green100;
            break;
          case AppointmentStatus.cancelled:
            statusColor = AppColors.error;
            statusBgColor = AppColors.error.withAlpha(25);
            break;
          case AppointmentStatus.completed:
            statusColor = AppColors.primary;
            statusBgColor = const Color(0xFFEFF6FF);
            break;
          default:
            statusColor = AppColors.amber600;
            statusBgColor = AppColors.yellow100;
        }

        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Text(
                'Chi tiết lịch khám',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              
              // Summary details
              Container(
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
                                  color: statusBgColor,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(record.status.label, style: TextStyle(
                                  color: statusColor, 
                                  fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          _SummaryRow(
                            icon: Icons.calendar_today,
                            label: 'Ngày khám',
                            value: '${date.day}/${date.month}/${date.year}',
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.access_time,
                            label: 'Khung giờ',
                            value: timeStr,
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.medical_services_outlined,
                            label: 'Chuyên khoa',
                            value: record.specialty,
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.person_outline,
                            label: 'Bác sĩ',
                            value: record.doctorName,
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.business, 
                            label: 'Địa điểm', 
                            value: record.location,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text('Đóng', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Status row ────────────────────────────────────────────────────
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: _statusBg,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                topRight: Radius.circular(14),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(_statusIcon, size: 14, color: _statusColor),
                    const SizedBox(width: 6),
                    Text(
                      record.status.label,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _statusColor,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Icon(Icons.access_time,
                        size: 13, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      _formatTime(record.dateTime),
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── Content ────────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Specialty + doctor
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFF6FF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.medical_services_outlined,
                          size: 18, color: AppColors.primary),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            record.specialty,
                            style: GoogleFonts.inter(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            record.doctorName,
                            style: GoogleFonts.inter(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Location
                Row(
                  children: [
                    const Icon(Icons.location_on_outlined,
                        size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      record.location,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: AppColors.surfaceLight),
                const SizedBox(height: 10),

                // Action buttons
                Row(
                  children: [
                    if (record.status == AppointmentStatus.pending || record.status == AppointmentStatus.confirmed)
                      TextButton(
                        onPressed: () => _showCancelDialog(context, record),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          'Hủy lịch',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    const Spacer(),
                    OutlinedButton(
                      onPressed: () => _showAppointmentDetails(context, record),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        side: const BorderSide(color: AppColors.borderLight),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        'Chi tiết',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textPrimary,
                        ),
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
