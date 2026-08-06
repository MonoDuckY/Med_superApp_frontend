// ── Enums ─────────────────────────────────────────────────────────────────────

enum MedicalRecordStatus { ongoing, completed }

enum VitalStatus { normal, high, low }

enum ClinicalNoteType {
  doctorReview,
  observation,
  recommendation,
  lifestyle,
  followUp,
}

// ── Sub-models ────────────────────────────────────────────────────────────────

class AttendingDoctor {
  final String initials;
  final String name;
  final List<String> specialties;
  final String hospital;

  const AttendingDoctor({
    required this.initials,
    required this.name,
    required this.specialties,
    required this.hospital,
  });
}

class VitalSigns {
  final String bloodPressure; // e.g. "120/80"
  final VitalStatus bloodPressureStatus;
  final int heartRate; // bpm
  final VitalStatus heartRateStatus;
  final int respiratoryRate; // lần/phút
  final VitalStatus respiratoryRateStatus;
  final double bodyTemperature; // °C
  final VitalStatus bodyTemperatureStatus;
  final double? bloodSugar; // mmol/L (optional)
  final VitalStatus? bloodSugarStatus;

  const VitalSigns({
    required this.bloodPressure,
    required this.bloodPressureStatus,
    required this.heartRate,
    required this.heartRateStatus,
    required this.respiratoryRate,
    required this.respiratoryRateStatus,
    required this.bodyTemperature,
    required this.bodyTemperatureStatus,
    this.bloodSugar,
    this.bloodSugarStatus,
  });
}

class Diagnosis {
  final String icdCode; // e.g. "I10"
  final String nameVi;
  final String nameEn;

  const Diagnosis({
    required this.icdCode,
    required this.nameVi,
    required this.nameEn,
  });
}

class ClinicalNote {
  final ClinicalNoteType type;
  final String content;
  final DateTime? date;
  final String? authorName;

  const ClinicalNote({
    required this.type,
    required this.content,
    this.date,
    this.authorName,
  });
}

class PrescriptionItem {
  final String medicineName;
  final String dosage; // e.g. "5mg"
  final String frequency; // e.g. "1 lần/ngày, sau ăn sáng"
  final int durationDays;
  final String? note;

  const PrescriptionItem({
    required this.medicineName,
    required this.dosage,
    required this.frequency,
    required this.durationDays,
    this.note,
  });
}

class MedicalImageAttachment {
  final String id;
  final String imageType; // "X-Quang", "CT Scan", "Siêu âm", "Xét nghiệm máu"
  final String description;
  final DateTime takenAt;

  const MedicalImageAttachment({
    required this.id,
    required this.imageType,
    required this.description,
    required this.takenAt,
  });
}

// ── Main models ───────────────────────────────────────────────────────────────

/// Summary model used in the list screen.
class MedicalRecord {
  final String id;
  final DateTime dateTime;
  final MedicalRecordStatus status;
  final String examinationName;
  final String specialty;
  final AttendingDoctor doctor;
  final String? icdCode;
  final String? diagnosisBrief;
  final bool hasLabResults;
  final bool hasPrescription;

  /// AF-02: examination completed but lab results not yet processed.
  final bool resultAvailable;

  const MedicalRecord({
    required this.id,
    required this.dateTime,
    required this.status,
    required this.examinationName,
    required this.specialty,
    required this.doctor,
    this.icdCode,
    this.diagnosisBrief,
    this.hasLabResults = false,
    this.hasPrescription = false,
    this.resultAvailable = true,
  });
}

/// Full detail model used in the detail screen.
class MedicalRecordDetail {
  final MedicalRecord summary;
  final VitalSigns? vitalSigns;
  final Diagnosis? diagnosis;
  final List<ClinicalNote> clinicalNotes;
  final List<PrescriptionItem> prescriptions;
  final List<MedicalImageAttachment> attachedImages;

  const MedicalRecordDetail({
    required this.summary,
    this.vitalSigns,
    this.diagnosis,
    this.clinicalNotes = const [],
    this.prescriptions = const [],
    this.attachedImages = const [],
  });
}
