import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

// ── Status Enum (mirrors backend MedicineScheduleStatus) ──────────────────────

enum MedicineScheduleStatus {
  notYet,
  taken,
  missed;

  static MedicineScheduleStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'TAKEN':
        return MedicineScheduleStatus.taken;
      case 'MISSED':
        return MedicineScheduleStatus.missed;
      default:
        return MedicineScheduleStatus.notYet;
    }
  }

  String get label {
    switch (this) {
      case MedicineScheduleStatus.taken:
        return 'Đã uống';
      case MedicineScheduleStatus.missed:
        return 'Bỏ lỡ';
      case MedicineScheduleStatus.notYet:
        return 'Chưa uống';
    }
  }
}

// ── Model ─────────────────────────────────────────────────────────────────────

class MedicineScheduleResponse {
  final String id;
  final String medicineName;
  final String dosage;
  final DateTime scheduledAt;
  final MedicineScheduleStatus status;
  final String prescriptionId;
  final String? note;

  const MedicineScheduleResponse({
    required this.id,
    required this.medicineName,
    required this.dosage,
    required this.scheduledAt,
    required this.status,
    required this.prescriptionId,
    this.note,
  });

  factory MedicineScheduleResponse.fromJson(Map<String, dynamic> json) {
    return MedicineScheduleResponse(
      id: json['id'] as String,
      medicineName: json['medicineName'] as String,
      dosage: json['dosage'] as String,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String).toLocal(),
      status: MedicineScheduleStatus.fromString(json['status'] as String),
      prescriptionId: json['prescriptionId'] as String,
      note: json['note'] as String?,
    );
  }

  MedicineScheduleResponse copyWith({
    MedicineScheduleStatus? status,
    DateTime? scheduledAt,
  }) {
    return MedicineScheduleResponse(
      id: id,
      medicineName: medicineName,
      dosage: dosage,
      scheduledAt: scheduledAt ?? this.scheduledAt,
      status: status ?? this.status,
      prescriptionId: prescriptionId,
      note: note,
    );
  }

  /// NOT_YET nhưng đã quá giờ uống
  bool get isOverdue =>
      status == MedicineScheduleStatus.notYet &&
      scheduledAt.isBefore(DateTime.now());

  String get displayLabel {
    if (status == MedicineScheduleStatus.taken) return 'Đã uống';
    if (status == MedicineScheduleStatus.missed) return 'Bỏ lỡ';
    if (isOverdue) return 'Quá giờ';
    return 'Chưa uống';
  }

  Color get statusColor {
    if (status == MedicineScheduleStatus.taken) return AppColors.success;
    if (status == MedicineScheduleStatus.missed) return AppColors.error;
    if (isOverdue) return AppColors.warning;
    return AppColors.primary;
  }

  IconData get statusIcon {
    if (status == MedicineScheduleStatus.taken) return Icons.check_circle_rounded;
    if (status == MedicineScheduleStatus.missed) return Icons.cancel_rounded;
    if (isOverdue) return Icons.warning_rounded;
    return Icons.alarm_rounded;
  }

  bool get isActionable =>
      status == MedicineScheduleStatus.notYet && !isOverdue;
}
