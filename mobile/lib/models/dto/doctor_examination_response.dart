import 'appointment_response.dart';
import 'medicine_schedule_response.dart';
import 'meal_response.dart';
import 'workout_response.dart';

class MedicalImageResponseDto {
  final String imageId;
  final String url;
  final DateTime? expiresAt;

  const MedicalImageResponseDto({
    required this.imageId,
    required this.url,
    this.expiresAt,
  });

  factory MedicalImageResponseDto.fromJson(Map<String, dynamic> json) {
    return MedicalImageResponseDto(
      imageId: json['imageId'] as String? ?? '',
      url: json['url'] as String? ?? '',
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'] as String)?.toLocal()
          : null,
    );
  }
}

class MedicalRecordResponseDto {
  final String id;
  final String appointmentId;
  final String? diagnosis;
  final String? note;
  final String? bloodPressure;
  final int? heartRate;
  final int? breathingRate;
  final double? bodyTemperature;
  final double? bloodLipids;
  final List<MedicalImageResponseDto> medicalImages;

  const MedicalRecordResponseDto({
    required this.id,
    required this.appointmentId,
    this.diagnosis,
    this.note,
    this.bloodPressure,
    this.heartRate,
    this.breathingRate,
    this.bodyTemperature,
    this.bloodLipids,
    this.medicalImages = const [],
  });

  factory MedicalRecordResponseDto.fromJson(Map<String, dynamic> json) {
    final imagesList = (json['medicalImages'] as List<dynamic>? ?? [])
        .map((e) => MedicalImageResponseDto.fromJson(e as Map<String, dynamic>))
        .toList();

    return MedicalRecordResponseDto(
      id: json['id'] as String? ?? '',
      appointmentId: json['appointmentId'] as String? ?? '',
      diagnosis: json['diagnosis'] as String?,
      note: json['note'] as String?,
      bloodPressure: json['bloodPressure'] as String?,
      heartRate: (json['heartRate'] as num?)?.toInt(),
      breathingRate: (json['breathingRate'] as num?)?.toInt(),
      bodyTemperature: (json['bodyTemperature'] as num?)?.toDouble(),
      bloodLipids: (json['bloodLipids'] as num?)?.toDouble(),
      medicalImages: imagesList,
    );
  }
}

class PrescriptionResponseDto {
  final String id;
  final String medicalRecordId;
  final String? content;
  final List<MedicineScheduleResponse> medicineSchedules;
  final List<MealResponse> meals;
  final List<WorkoutResponse> workouts;

  const PrescriptionResponseDto({
    required this.id,
    required this.medicalRecordId,
    this.content,
    this.medicineSchedules = const [],
    this.meals = const [],
    this.workouts = const [],
  });

  factory PrescriptionResponseDto.fromJson(Map<String, dynamic> json) {
    final schedList = (json['medicineSchedules'] as List<dynamic>? ?? [])
        .map((e) => MedicineScheduleResponse.fromJson(e as Map<String, dynamic>))
        .toList();
    final mealList = (json['meals'] as List<dynamic>? ?? [])
        .map((e) => MealResponse.fromJson(e as Map<String, dynamic>))
        .toList();
    final workoutList = (json['workouts'] as List<dynamic>? ?? [])
        .map((e) => WorkoutResponse.fromJson(e as Map<String, dynamic>))
        .toList();

    return PrescriptionResponseDto(
      id: json['id'] as String? ?? '',
      medicalRecordId: json['medicalRecordId'] as String? ?? '',
      content: json['content'] as String?,
      medicineSchedules: schedList,
      meals: mealList,
      workouts: workoutList,
    );
  }
}

class ExaminationPatientDto {
  final String id;
  final String fullName;
  final String? phoneNumber;
  final String? gender;
  final String? dateOfBirth;
  final String? medicalHistory;
  final String? currentSickness;
  final double? height;
  final double? weight;
  final String? bloodType;

  const ExaminationPatientDto({
    required this.id,
    required this.fullName,
    this.phoneNumber,
    this.gender,
    this.dateOfBirth,
    this.medicalHistory,
    this.currentSickness,
    this.height,
    this.weight,
    this.bloodType,
  });

  factory ExaminationPatientDto.fromJson(Map<String, dynamic> json) {
    return ExaminationPatientDto(
      id: json['id'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      medicalHistory: json['medicalHistory'] as String?,
      currentSickness: json['currentSickness'] as String?,
      height: (json['height'] as num?)?.toDouble(),
      weight: (json['weight'] as num?)?.toDouble(),
      bloodType: json['bloodType'] as String?,
    );
  }
}

class DoctorExaminationResponseDto {
  final AppointmentResponse appointment;
  final ExaminationPatientDto? patient;
  final MedicalRecordResponseDto? medicalRecord;
  final List<PrescriptionResponseDto> prescriptions;

  const DoctorExaminationResponseDto({
    required this.appointment,
    this.patient,
    this.medicalRecord,
    this.prescriptions = const [],
  });

  factory DoctorExaminationResponseDto.fromJson(Map<String, dynamic> json) {
    final presList = (json['prescriptions'] as List<dynamic>? ?? [])
        .map((e) => PrescriptionResponseDto.fromJson(e as Map<String, dynamic>))
        .toList();

    return DoctorExaminationResponseDto(
      appointment: AppointmentResponse.fromJson(json['appointment'] as Map<String, dynamic>),
      patient: json['patient'] != null
          ? ExaminationPatientDto.fromJson(json['patient'] as Map<String, dynamic>)
          : null,
      medicalRecord: json['medicalRecord'] != null
          ? MedicalRecordResponseDto.fromJson(json['medicalRecord'] as Map<String, dynamic>)
          : null,
      prescriptions: presList,
    );
  }
}
