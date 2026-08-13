import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../models/medical_record_model.dart';
import '../../view_models/medical_record_viewmodel.dart';

class MedicalRecordListView extends StatelessWidget {
  const MedicalRecordListView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MedicalRecordViewModel()..loadRecords(),
      child: const _ListScaffold(),
    );
  }
}

// ── Scaffold ──────────────────────────────────────────────────────────────────

class _ListScaffold extends StatelessWidget {
  const _ListScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Column(
          children: [
            _Header(),
            _PatientInfoCard(),
            _FilterChips(),
            const Divider(height: 1, color: AppColors.borderLight),
            const Expanded(child: _RecordList()),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(4, 8, 16, 8),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded,
                color: AppColors.textPrimary, size: 18),
            onPressed: () => context.pop(),
          ),
          Expanded(
            child: Text(
              'Hồ sơ bệnh án',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const Icon(Icons.notifications_outlined,
              color: AppColors.textSecondary, size: 22),
        ],
      ),
    );
  }
}

// ── Patient info ──────────────────────────────────────────────────────────────

class _PatientInfoCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MedicalRecordViewModel>();
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.teal],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                'VN',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                vm.userName,
                style: GoogleFonts.inter(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'MID-20241105  ·  DOB: 12 Mar 1985',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Filter chips ──────────────────────────────────────────────────────────────

class _FilterChips extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MedicalRecordViewModel>();
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _Chip(
              label: 'Tất cả',
              filter: MedicalRecordFilter.all,
              current: vm.currentFilter,
              onTap: () => vm.setFilter(MedicalRecordFilter.all),
            ),
            const SizedBox(width: 8),
            _Chip(
              label: 'Đang điều trị',
              dot: AppColors.orange,
              filter: MedicalRecordFilter.ongoing,
              current: vm.currentFilter,
              onTap: () => vm.setFilter(MedicalRecordFilter.ongoing),
            ),
            const SizedBox(width: 8),
            _Chip(
              label: 'Đã hoàn thành',
              dot: AppColors.success,
              filter: MedicalRecordFilter.completed,
              current: vm.currentFilter,
              onTap: () => vm.setFilter(MedicalRecordFilter.completed),
            ),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color? dot;
  final MedicalRecordFilter filter;
  final MedicalRecordFilter current;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    this.dot,
    required this.filter,
    required this.current,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isSelected = filter == current;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withAlpha(12) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.borderLight,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (dot != null) ...[
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: dot, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
            ],
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Record list ───────────────────────────────────────────────────────────────

class _RecordList extends StatelessWidget {
  const _RecordList();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MedicalRecordViewModel>();

    if (vm.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    // AF-01: Empty state
    if (vm.isEmpty) {
      return _EmptyState(filter: vm.currentFilter);
    }

    final byYear = vm.recordsByYear;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        for (final year in byYear.keys) ...[
          _YearLabel(year: year),
          const SizedBox(height: 10),
          for (final record in byYear[year]!) ...[
            _RecordCard(record: record),
            const SizedBox(height: 12),
          ],
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _YearLabel extends StatelessWidget {
  final int year;
  const _YearLabel({required this.year});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 2),
      child: Text(
        '$year',
        style: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: AppColors.textHint,
          letterSpacing: 0.4,
        ),
      ),
    );
  }
}

// ── Record card ───────────────────────────────────────────────────────────────

class _RecordCard extends StatelessWidget {
  final MedicalRecord record;
  const _RecordCard({required this.record});

  Color get _dotColor {
    if (record.status == MedicalRecordStatus.ongoing) {
      return AppColors.orange;
    }
    return AppColors.success;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/profile/medical-records/${record.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderLight),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(6),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Card header ───────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Date + status
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _dotColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _formatDateTime(record.dateTime),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      _StatusBadge(status: record.status),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Examination name
                  Text(
                    record.examinationName,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),

                  // Specialty · Doctor
                  Text(
                    '${record.specialty}  ·  ${record.doctor.name}',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),

                  // ICD + diagnosis — only if result is available
                  if (record.resultAvailable && record.icdCode != null) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'ICD-10 ${record.icdCode}',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            record.diagnosisBrief ?? '',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],

                  // AF-02: result not yet available
                  if (!record.resultAvailable) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.amber100,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.amber200),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.hourglass_top_rounded,
                              size: 12, color: AppColors.amber600),
                          const SizedBox(width: 6),
                          Text(
                            'Kết quả đang được xử lý...',
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppColors.amber600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // ── Action buttons ────────────────────────────────────────────────
            if (record.resultAvailable && record.hasLabResults) ...[
              const Divider(height: 1, color: AppColors.surfaceLight),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
                child: Row(
                  children: [
                    _ActionButton(
                      icon: Icons.biotech_outlined,
                      label: 'Kết quả xét nghiệm',
                      onTap: () => context
                          .push('/profile/medical-records/${record.id}'),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    final DateFormat dateFmt = DateFormat('dd MMM  HH:mm', 'vi');
    return dateFmt.format(dt);
  }
}

class _StatusBadge extends StatelessWidget {
  final MedicalRecordStatus status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final isOngoing = status == MedicalRecordStatus.ongoing;
    final color = isOngoing ? AppColors.orange : AppColors.success;
    final label = isOngoing ? 'Đang điều trị' : 'Đã hoàn thành';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withAlpha(60)),
      ),
      child: Text(
        label,
        style: GoogleFonts.inter(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.primary.withAlpha(10),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.primary.withAlpha(40)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: AppColors.primary),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── AF-01: Empty state ────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final MedicalRecordFilter filter;
  const _EmptyState({required this.filter});

  @override
  Widget build(BuildContext context) {
    final message = filter == MedicalRecordFilter.all
        ? 'Bạn chưa có hồ sơ khám nào'
        : filter == MedicalRecordFilter.ongoing
            ? 'Không có ca điều trị nào đang diễn ra'
            : 'Không có ca khám nào đã hoàn thành';

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(12),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.folder_open_outlined,
                size: 36,
                color: AppColors.primary.withAlpha(160),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Hồ sơ sẽ được tạo sau khi bạn hoàn thành ca khám đầu tiên.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
