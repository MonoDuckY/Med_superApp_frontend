import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../models/medical_record_model.dart';
import '../../view_models/medical_record_detail_viewmodel.dart';

class MedicalRecordDetailView extends StatelessWidget {
  final String recordId;
  const MedicalRecordDetailView({super.key, required this.recordId});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MedicalRecordDetailViewModel(recordId: recordId)..loadDetail(),
      child: const _DetailScaffold(),
    );
  }
}

// ── Scaffold ──────────────────────────────────────────────────────────────────

class _DetailScaffold extends StatelessWidget {
  const _DetailScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MedicalRecordDetailViewModel>();

    if (vm.isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (vm.errorMessage != null || vm.detail == null) {
      return Scaffold(
        appBar: AppBar(
          leading: BackButton(onPressed: () => context.pop()),
          title: Text('Chi tiết ca khám',
              style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        ),
        body: Center(
          child: Text(vm.errorMessage ?? 'Không tìm thấy hồ sơ.',
              style: GoogleFonts.inter(color: AppColors.textSecondary)),
        ),
      );
    }

    final detail = vm.detail!;
    final record = detail.summary;

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Column(
          children: [
            _DetailHeader(record: record),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Date/time row
                    _DateTimeRow(dateTime: record.dateTime),
                    const SizedBox(height: 20),

                    // AF-02: Result pending banner
                    if (!vm.resultAvailable) ...[
                      _ResultPendingBanner(),
                      const SizedBox(height: 20),
                    ],

                    // Doctor section
                    _SectionHeader(label: 'BÁC SĨ ĐIỀU TRỊ'),
                    const SizedBox(height: 10),
                    _DoctorCard(doctor: record.doctor),
                    const SizedBox(height: 24),

                    // Vital signs (always show)
                    if (detail.vitalSigns != null) ...[
                      _SectionHeader(
                        label: 'CHỈ SỐ SINH TỒN',
                        trailing: 'Do lúc thăm khám',
                      ),
                      const SizedBox(height: 10),
                      _VitalSignsGrid(vitals: detail.vitalSigns!),
                      const SizedBox(height: 24),
                    ],

                    // Only show following sections if result is available
                    if (vm.resultAvailable) ...[
                      // Diagnosis
                      if (detail.diagnosis != null) ...[
                        _SectionHeader(label: 'CHẨN ĐOÁN'),
                        const SizedBox(height: 10),
                        _DiagnosisCard(diagnosis: detail.diagnosis!),
                        const SizedBox(height: 24),
                      ],

                      // Clinical notes
                      if (detail.clinicalNotes.isNotEmpty) ...[
                        _SectionHeader(label: 'GHI CHÚ LÂM SÀNG'),
                        const SizedBox(height: 10),
                        _ClinicalNotesCard(
                          notes: detail.clinicalNotes,
                          doctorName: record.doctor.name,
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Prescription (NEW section)
                      if (vm.hasPrescriptions) ...[
                        _SectionHeader(label: 'ĐƠN THUỐC'),
                        const SizedBox(height: 10),
                        _PrescriptionCard(items: detail.prescriptions),
                        const SizedBox(height: 24),
                      ],

                      // Attached images (NEW section)
                      if (vm.hasAttachedImages) ...[
                        _SectionHeader(label: 'HÌNH ẢNH Y TẾ ĐÍNH KÈM'),
                        const SizedBox(height: 10),
                        _MedicalImagesSection(images: detail.attachedImages),
                        const SizedBox(height: 24),
                      ],
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _DetailHeader extends StatelessWidget {
  final MedicalRecord record;
  const _DetailHeader({required this.record});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(4, 8, 16, 12),
      child: Column(
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: AppColors.textPrimary, size: 18),
                onPressed: () => context.pop(),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Chi tiết ca khám',
                      style: GoogleFonts.inter(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      'Hồ sơ bệnh án điện tử',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              _StatusBadgeLarge(status: record.status),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusBadgeLarge extends StatelessWidget {
  final MedicalRecordStatus status;
  const _StatusBadgeLarge({required this.status});

  @override
  Widget build(BuildContext context) {
    final isOngoing = status == MedicalRecordStatus.ongoing;
    final color = isOngoing ? AppColors.orange : AppColors.success;
    final label = isOngoing ? 'Đang điều trị' : 'Đã hoàn thành';
    final icon = isOngoing ? Icons.loop_rounded : Icons.check_circle_outline_rounded;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Date/time row ─────────────────────────────────────────────────────────────

class _DateTimeRow extends StatelessWidget {
  final DateTime dateTime;
  const _DateTimeRow({required this.dateTime});

  @override
  Widget build(BuildContext context) {
    final dateFmt = DateFormat('EEEE, d MMMM y', 'vi');
    final timeFmt = DateFormat('HH:mm', 'vi');
    final timeLabel = dateTime.hour < 12 ? 'SA' : 'CH';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(8),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withAlpha(30)),
      ),
      child: Row(
        children: [
          const Icon(Icons.calendar_today_outlined,
              size: 14, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(
            dateFmt.format(dateTime),
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          const Icon(Icons.access_time_rounded,
              size: 14, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            '${timeFmt.format(dateTime)} $timeLabel',
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

// ── AF-02: Result pending banner ──────────────────────────────────────────────

class _ResultPendingBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.amber100,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.amber200),
      ),
      child: Row(
        children: [
          const Icon(Icons.hourglass_empty_rounded,
              color: AppColors.amber600, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Kết quả đang được xử lý',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.amber900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Kết quả chẩn đoán và xét nghiệm chưa sẵn sàng. Vui lòng quay lại sau hoặc liên hệ bệnh viện để biết thêm thông tin.',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.amber900,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Section header ────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  final String? trailing;
  const _SectionHeader({required this.label, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textHint,
            letterSpacing: 0.6,
          ),
        ),
        if (trailing != null) ...[
          const Spacer(),
          Text(
            trailing!,
            style: GoogleFonts.inter(
              fontSize: 11,
              color: AppColors.textHint,
            ),
          ),
        ],
      ],
    );
  }
}

// ── Doctor card ───────────────────────────────────────────────────────────────

class _DoctorCard extends StatelessWidget {
  final AttendingDoctor doctor;
  const _DoctorCard({required this.doctor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withAlpha(200),
                  AppColors.teal,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                doctor.initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doctor.name,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),

                Row(
                  children: [
                    const Icon(Icons.location_on_outlined,
                        size: 11, color: AppColors.textHint),
                    const SizedBox(width: 4),
                    Text(
                      doctor.hospital,
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
          const Icon(Icons.chevron_right_rounded,
              color: AppColors.textHint, size: 18),
        ],
      ),
    );
  }
}

// ── Vital signs ───────────────────────────────────────────────────────────────

class _VitalSignsGrid extends StatelessWidget {
  final VitalSigns vitals;
  const _VitalSignsGrid({required this.vitals});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _VitalCard(
                icon: Icons.favorite_outline_rounded,
                iconColor: AppColors.error,
                value: vitals.bloodPressure,
                unit: 'mmHg',
                label: 'Huyết áp',
                status: vitals.bloodPressureStatus,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _VitalCard(
                icon: Icons.monitor_heart_outlined,
                iconColor: AppColors.pink500,
                value: '${vitals.heartRate}',
                unit: 'bpm',
                label: 'Nhịp tim',
                status: vitals.heartRateStatus,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _VitalCard(
                icon: Icons.air_outlined,
                iconColor: AppColors.primary,
                value: '${vitals.respiratoryRate}',
                unit: 'lần/phút',
                label: 'Nhịp thở',
                status: vitals.respiratoryRateStatus,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _VitalCard(
                icon: Icons.thermostat_outlined,
                iconColor: AppColors.warning,
                value: '${vitals.bodyTemperature}',
                unit: '°C',
                label: 'Thân nhiệt',
                status: vitals.bodyTemperatureStatus,
              ),
            ),
          ],
        ),
        if (vitals.bloodSugar != null) ...[
          const SizedBox(height: 10),
          _VitalCard(
            icon: Icons.water_drop_outlined,
            iconColor: AppColors.success,
            value: '${vitals.bloodSugar}',
            unit: 'mmol/L',
            label: 'Mỡ máu',
            status: vitals.bloodSugarStatus ?? VitalStatus.normal,
            isWide: true,
            subLabel: '≈ ${((vitals.bloodSugar ?? 0) * 18.02).round()} mg/dL',
          ),
        ],
      ],
    );
  }
}

class _VitalCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String value;
  final String unit;
  final String label;
  final VitalStatus status;
  final bool isWide;
  final String? subLabel;

  const _VitalCard({
    required this.icon,
    required this.iconColor,
    required this.value,
    required this.unit,
    required this.label,
    required this.status,
    this.isWide = false,
    this.subLabel,
  });

  Color get _statusColor {
    switch (status) {
      case VitalStatus.normal:
        return AppColors.success;
      case VitalStatus.high:
        return AppColors.error;
      case VitalStatus.low:
        return AppColors.primary;
    }
  }

  String get _statusLabel {
    switch (status) {
      case VitalStatus.normal:
        return 'Bình thường';
      case VitalStatus.high:
        return 'Cao';
      case VitalStatus.low:
        return 'Thấp';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: isWide
          ? Row(
              children: [
                Icon(icon, size: 20, color: iconColor),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            value,
                            style: GoogleFonts.inter(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            unit,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      if (subLabel != null)
                        Text(
                          subLabel!,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            color: AppColors.textHint,
                          ),
                        ),
                    ],
                  ),
                ),
                _StatusPill(label: _statusLabel, color: _statusColor),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(icon, size: 16, color: iconColor),
                    const Spacer(),
                    _StatusPill(label: _statusLabel, color: _statusColor),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      value,
                      style: GoogleFonts.inter(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 3),
                    Text(
                      unit,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Text(
                  label,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusPill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: color.withAlpha(18),
        borderRadius: BorderRadius.circular(8),
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

// ── Diagnosis card ────────────────────────────────────────────────────────────

class _DiagnosisCard extends StatelessWidget {
  final Diagnosis diagnosis;
  const _DiagnosisCard({required this.diagnosis});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary.withAlpha(15),
            AppColors.teal.withAlpha(10),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withAlpha(40)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Text(
                  'ICD-10',
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withAlpha(200),
                  ),
                ),
                Text(
                  diagnosis.icdCode,
                  style: GoogleFonts.inter(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  diagnosis.nameVi,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  diagnosis.nameEn,
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Clinical notes ────────────────────────────────────────────────────────────

class _ClinicalNotesCard extends StatelessWidget {
  final List<ClinicalNote> notes;
  final String doctorName;
  const _ClinicalNotesCard({required this.notes, required this.doctorName});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          for (int i = 0; i < notes.length; i++) ...[
            _NoteRow(note: notes[i]),
            if (i < notes.length - 1)
              const Divider(height: 1, indent: 14, endIndent: 14,
                  color: AppColors.surfaceLight),
          ],
          // Doctor signature
          const Divider(height: 1, color: AppColors.surfaceLight),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      doctorName.split(' ').last[0],
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  doctorName,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: AppColors.success.withAlpha(60)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified_outlined,
                          size: 11, color: AppColors.success),
                      const SizedBox(width: 5),
                      Text(
                        'Đã ký',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.success,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NoteRow extends StatelessWidget {
  final ClinicalNote note;
  const _NoteRow({required this.note});

  IconData get _icon {
    switch (note.type) {
      case ClinicalNoteType.doctorReview:
        return Icons.description_outlined;
      case ClinicalNoteType.observation:
        return Icons.visibility_outlined;
      case ClinicalNoteType.recommendation:
        return Icons.recommend_outlined;
      case ClinicalNoteType.lifestyle:
        return Icons.self_improvement_outlined;
      case ClinicalNoteType.followUp:
        return Icons.event_repeat_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(_icon, size: 16, color: AppColors.textHint),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              note.content,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textPrimary,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Prescription section (NEW) ────────────────────────────────────────────────

class _PrescriptionCard extends StatelessWidget {
  final List<PrescriptionItem> items;
  const _PrescriptionCard({required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          // Header row
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(8),
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(13)),
              border: Border(
                  bottom: BorderSide(color: AppColors.borderLight)),
            ),
            child: Row(
              children: [
                const Icon(Icons.medication_rounded,
                    size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  '${items.length} loại thuốc được kê',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.sky700,
                  ),
                ),
              ],
            ),
          ),
          // Prescription items
          for (int i = 0; i < items.length; i++) ...[
            _PrescriptionRow(item: items[i], index: i + 1),
            if (i < items.length - 1)
              const Divider(height: 1, indent: 14, endIndent: 14,
                  color: AppColors.surfaceLight),
          ],
        ],
      ),
    );
  }
}

class _PrescriptionRow extends StatelessWidget {
  final PrescriptionItem item;
  final int index;
  const _PrescriptionRow({required this.item, required this.index});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Number badge
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(18),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$index',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      item.medicineName,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      item.dosage,
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  item.frequency,
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    const Icon(Icons.schedule_outlined,
                        size: 11, color: AppColors.textHint),
                    const SizedBox(width: 4),
                    Text(
                      '${item.durationDays} ngày',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textHint,
                      ),
                    ),
                    if (item.note != null) ...[
                      const SizedBox(width: 10),
                      const Icon(Icons.info_outline_rounded,
                          size: 11, color: AppColors.warning),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          item.note!,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.amber600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
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

// ── Medical images section (NEW) ──────────────────────────────────────────────

class _MedicalImagesSection extends StatelessWidget {
  final List<MedicalImageAttachment> images;
  const _MedicalImagesSection({required this.images});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: images.map((img) => _ImageCard(image: img)).toList(),
    );
  }
}

class _ImageCard extends StatelessWidget {
  final MedicalImageAttachment image;
  const _ImageCard({required this.image});

  IconData get _icon {
    final type = image.imageType.toLowerCase();
    if (type.contains('ct') || type.contains('scan')) return Icons.document_scanner_outlined;
    if (type.contains('x-quang') || type.contains('xray')) return Icons.camera_alt_outlined;
    if (type.contains('điện tâm') || type.contains('ecg')) return Icons.monitor_heart_outlined;
    if (type.contains('siêu âm')) return Icons.graphic_eq_rounded;
    return Icons.biotech_outlined;
  }

  Color get _color {
    final type = image.imageType.toLowerCase();
    if (type.contains('ct')) return AppColors.purple;
    if (type.contains('x-quang')) return AppColors.primary;
    if (type.contains('điện tâm') || type.contains('ecg')) return AppColors.error;
    if (type.contains('siêu âm')) return AppColors.success;
    return AppColors.teal600;
  }

  void _showFullImage(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppBar(
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    title: Text(
                      image.imageType,
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    leading: IconButton(
                      icon: const Icon(Icons.close_rounded, color: AppColors.textPrimary),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ),
                  ClipRRect(
                    borderRadius: const BorderRadius.only(
                      bottomLeft: Radius.circular(16),
                      bottomRight: Radius.circular(16),
                    ),
                    child: image.imageUrl != null && image.imageUrl!.isNotEmpty
                        ? Image.network(
                            image.imageUrl!,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) => Container(
                              height: 200,
                              color: AppColors.surfaceLight,
                              child: const Center(
                                child: Text('Không thể tải hình ảnh y tế'),
                              ),
                            ),
                          )
                        : Container(
                            height: 200,
                            color: AppColors.surfaceLight,
                            child: Center(
                              child: Icon(_icon, size: 64, color: _color),
                            ),
                          ),
                  ),
                  if (image.description.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        image.description,
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasNetworkImage = image.imageUrl != null && image.imageUrl!.isNotEmpty;

    return InkWell(
      onTap: () => _showFullImage(context),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            // Thumbnail
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: _color.withAlpha(15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _color.withAlpha(40)),
                ),
                child: hasNetworkImage
                    ? Image.network(
                        image.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Icon(_icon, size: 26, color: _color),
                      )
                    : Icon(_icon, size: 26, color: _color),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: _color.withAlpha(12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      image.imageType,
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _color,
                      ),
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    image.description,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    DateFormat('dd/MM/yyyy · HH:mm').format(image.takenAt),
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.zoom_in_rounded,
                      size: 13, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Text(
                    'Xem',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
