import 'package:dio/dio.dart';
import '../../models/dto/doctor_examination_response.dart';
import '../../models/medical_record_model.dart';
import '../abstract/medical_record_service_abstract.dart';
import 'api_client.dart';

class RemoteMedicalRecordService implements IMedicalRecordService {
  final Dio _dio = ApiClient.instance;

  // Cache to avoid refetching on detail view if already loaded
  List<DoctorExaminationResponseDto> _cachedExaminations = [];

  @override
  Future<List<MedicalRecord>> getRecords() async {
    try {
      final response = await _dio.get('/api/patient/medical-records');

      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        _cachedExaminations = data
            .map((json) => DoctorExaminationResponseDto.fromJson(json as Map<String, dynamic>))
            .toList();

        return _cachedExaminations.map(_mapToSummary).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  @override
  Future<MedicalRecordDetail?> getRecordDetail(String id) async {
    try {
      if (_cachedExaminations.isEmpty) {
        await getRecords();
      }

      final exam = _cachedExaminations.where(
        (e) => e.appointment.id == id || (e.medicalRecord != null && e.medicalRecord!.id == id),
      ).firstOrNull;

      if (exam == null) {
        // Fallback: try searching again after refreshing records
        await getRecords();
        final refreshedExam = _cachedExaminations.where(
          (e) => e.appointment.id == id || (e.medicalRecord != null && e.medicalRecord!.id == id),
        ).firstOrNull;
        if (refreshedExam != null) {
          return _mapToDetail(refreshedExam);
        }
        return null;
      }

      return _mapToDetail(exam);
    } catch (e) {
      return null;
    }
  }

  // ── Mapping Helpers ────────────────────────────────────────────────────────

  MedicalRecord _mapToSummary(DoctorExaminationResponseDto exam) {
    final appt = exam.appointment;
    final mr = exam.medicalRecord;

    DateTime dt = DateTime.now();
    if (appt.doctorWorkSlot != null && appt.slot != null) {
      final dateStr = appt.doctorWorkSlot!.workDate;
      String timeStr = appt.slot!.startTime;
      if (timeStr.length == 5) {
        timeStr = '$timeStr:00';
      }
      dt = DateTime.tryParse('${dateStr}T$timeStr') ?? DateTime.now();
    } else if (appt.requestedAt != null) {
      dt = DateTime.tryParse(appt.requestedAt!)?.toLocal() ?? DateTime.now();
    }

    final isCompleted = appt.status.toUpperCase() == 'COMPLETED';
    final status = isCompleted ? MedicalRecordStatus.completed : MedicalRecordStatus.ongoing;

    final docName = appt.doctor?.fullName ?? 'Bác sĩ chuyên khoa';
    final roomName = appt.room?.roomName ?? 'Phòng khám';
    final location = appt.room != null ? '${appt.room!.id} - ${appt.room!.roomName}' : 'Bệnh viện';

    final doctor = AttendingDoctor(
      initials: _getInitials(docName),
      name: docName,
      specialties: [roomName.isNotEmpty ? roomName : 'Đa khoa'],
      hospital: location,
    );

    String? icd;
    if (mr?.diagnosis != null) {
      final match = RegExp(r'^([A-Z]\d{2}(?:\.\d+)?)\b').firstMatch(mr!.diagnosis!.trim());
      if (match != null) {
        icd = match.group(1);
      }
    }

    final bool hasImages = (mr?.medicalImages.isNotEmpty ?? false);
    final bool hasLipids = mr?.bloodLipids != null;
    final bool hasLabResults = hasImages || hasLipids;
    final bool hasPrescriptions = exam.prescriptions.isNotEmpty;
    final bool resultAvailable = isCompleted || mr?.diagnosis != null;

    final examName = roomName.isNotEmpty ? 'Khám $roomName' : 'Khám tổng quát';

    return MedicalRecord(
      id: appt.id,
      dateTime: dt,
      status: status,
      examinationName: examName,
      specialty: roomName,
      doctor: doctor,
      icdCode: icd,
      diagnosisBrief: mr?.diagnosis ?? (isCompleted ? 'Khám hoàn thành' : 'Đang xử lý kết quả'),
      hasLabResults: hasLabResults,
      hasPrescription: hasPrescriptions,
      resultAvailable: resultAvailable,
    );
  }

  MedicalRecordDetail _mapToDetail(DoctorExaminationResponseDto exam) {
    final summary = _mapToSummary(exam);
    final mr = exam.medicalRecord;

    // 1. Vital signs
    VitalSigns? vitals;
    if (mr != null) {
      final bp = mr.bloodPressure ?? '120/80';
      final systolic = double.tryParse(bp.split('/').first) ?? 120.0;
      final bpStatus = systolic >= 140
          ? VitalStatus.high
          : (systolic <= 90 ? VitalStatus.low : VitalStatus.normal);

      final hr = mr.heartRate ?? 75;
      final hrStatus = hr > 100
          ? VitalStatus.high
          : (hr < 60 ? VitalStatus.low : VitalStatus.normal);

      final rr = mr.breathingRate ?? 16;
      final rrStatus = rr > 20
          ? VitalStatus.high
          : (rr < 12 ? VitalStatus.low : VitalStatus.normal);

      final temp = mr.bodyTemperature ?? 36.5;
      final tempStatus = temp > 37.5
          ? VitalStatus.high
          : (temp < 35.5 ? VitalStatus.low : VitalStatus.normal);

      final lipids = mr.bloodLipids;
      final lipidsStatus = lipids != null
          ? (lipids > 5.2 ? VitalStatus.high : VitalStatus.normal)
          : null;

      vitals = VitalSigns(
        bloodPressure: bp,
        bloodPressureStatus: bpStatus,
        heartRate: hr,
        heartRateStatus: hrStatus,
        respiratoryRate: rr,
        respiratoryRateStatus: rrStatus,
        bodyTemperature: temp,
        bodyTemperatureStatus: tempStatus,
        bloodSugar: lipids,
        bloodSugarStatus: lipidsStatus,
      );
    }

    // 2. Diagnosis
    Diagnosis? diagnosis;
    if (mr?.diagnosis != null && mr!.diagnosis!.trim().isNotEmpty) {
      diagnosis = Diagnosis(
        icdCode: summary.icdCode ?? 'ICD-10',
        nameVi: mr.diagnosis!,
        nameEn: 'Medical examination conclusion',
      );
    }

    // 3. Clinical notes
    final notes = <ClinicalNote>[];
    if (mr?.note != null && mr!.note!.trim().isNotEmpty) {
      notes.add(ClinicalNote(
        type: ClinicalNoteType.doctorReview,
        content: mr.note!,
        authorName: summary.doctor.name,
      ));
    }
    if (exam.patient?.medicalHistory != null && exam.patient!.medicalHistory!.trim().isNotEmpty) {
      notes.add(ClinicalNote(
        type: ClinicalNoteType.observation,
        content: 'Tiền sử bệnh lý: ${exam.patient!.medicalHistory!}',
      ));
    }
    if (exam.patient?.currentSickness != null && exam.patient!.currentSickness!.trim().isNotEmpty) {
      notes.add(ClinicalNote(
        type: ClinicalNoteType.recommendation,
        content: 'Triệu chứng ghi nhận: ${exam.patient!.currentSickness!}',
      ));
    }
    for (final p in exam.prescriptions) {
      if (p.content != null && p.content!.trim().isNotEmpty) {
        notes.add(ClinicalNote(
          type: ClinicalNoteType.lifestyle,
          content: p.content!,
        ));
      }
    }

    // 4. Prescriptions
    final prescriptionItems = <PrescriptionItem>[];
    final seenMeds = <String>{};
    for (final p in exam.prescriptions) {
      for (final s in p.medicineSchedules) {
        final key = '${s.medicineName}-${s.dosage}';
        if (seenMeds.add(key)) {
          prescriptionItems.add(PrescriptionItem(
            medicineName: s.medicineName,
            dosage: s.dosage,
            frequency: s.note ?? 'Theo chỉ định của bác sĩ',
            durationDays: 30,
            note: s.note,
          ));
        }
      }
    }

    // 5. Attached images
    final attachedImages = <MedicalImageAttachment>[];
    if (mr != null) {
      for (final img in mr.medicalImages) {
        attachedImages.add(MedicalImageAttachment(
          id: img.imageId,
          imageType: 'Hình ảnh y tế / Siêu âm',
          description: 'Ảnh kết quả chẩn đoán y tế',
          takenAt: summary.dateTime,
          imageUrl: img.url,
        ));
      }
    }

    return MedicalRecordDetail(
      summary: summary,
      vitalSigns: vitals,
      diagnosis: diagnosis,
      clinicalNotes: notes,
      prescriptions: prescriptionItems,
      attachedImages: attachedImages,
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length > 1) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name.substring(0, 1).toUpperCase() : 'BS';
  }
}
