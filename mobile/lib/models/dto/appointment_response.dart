class UserSummaryResponse {
  final String id;
  final String fullName;
  final String? phoneNumber;
  final String? gender;

  const UserSummaryResponse({
    required this.id,
    required this.fullName,
    this.phoneNumber,
    this.gender,
  });

  factory UserSummaryResponse.fromJson(Map<String, dynamic> json) {
    return UserSummaryResponse(
      id:          json['id'] as String? ?? '',
      fullName:    json['fullName'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String?,
      gender:      json['gender'] as String?,
    );
  }
}

class DoctorWorkSlotResponse {
  final String id;
  final String doctorId;
  final String workDate;
  final String slotId;
  final String roomId;
  final String status;

  const DoctorWorkSlotResponse({
    required this.id,
    required this.doctorId,
    required this.workDate,
    required this.slotId,
    required this.roomId,
    required this.status,
  });

  factory DoctorWorkSlotResponse.fromJson(Map<String, dynamic> json) {
    return DoctorWorkSlotResponse(
      id:       json['id'] as String? ?? '',
      doctorId: json['doctorId'] as String? ?? '',
      workDate: json['workDate'] as String? ?? '',
      slotId:   json['slotId'] as String? ?? '',
      roomId:   json['roomId'] as String? ?? '',
      status:   json['status'] as String? ?? '',
    );
  }
}

class WorkSlotResponse {
  final String id;
  final String startTime;
  final String endTime;

  const WorkSlotResponse({
    required this.id,
    required this.startTime,
    required this.endTime,
  });

  factory WorkSlotResponse.fromJson(Map<String, dynamic> json) {
    return WorkSlotResponse(
      id:        json['id'] as String? ?? '',
      startTime: json['startTime'] as String? ?? '',
      endTime:   json['endTime'] as String? ?? '',
    );
  }
}

class ClinicRoomResponse {
  final String id;
  final String roomName;

  const ClinicRoomResponse({
    required this.id,
    required this.roomName,
  });

  factory ClinicRoomResponse.fromJson(Map<String, dynamic> json) {
    return ClinicRoomResponse(
      id:       json['id'] as String? ?? '',
      roomName: json['name'] as String? ?? '',
    );
  }
}

class AppointmentResponse {
  final String id;
  final String patientId;
  final UserSummaryResponse? patient;
  final UserSummaryResponse? doctor;
  final String doctorWorkSlotId;
  final DoctorWorkSlotResponse? doctorWorkSlot;
  final WorkSlotResponse? slot;
  final ClinicRoomResponse? room;
  final String status;
  final String? diagnosis;
  final String? requestedAt;
  final String? cancelledBy;
  final String? cancelledAt;
  final String? cancellationReason;

  const AppointmentResponse({
    required this.id,
    required this.patientId,
    this.patient,
    this.doctor,
    required this.doctorWorkSlotId,
    this.doctorWorkSlot,
    this.slot,
    this.room,
    required this.status,
    this.diagnosis,
    this.requestedAt,
    this.cancelledBy,
    this.cancelledAt,
    this.cancellationReason,
  });

  factory AppointmentResponse.fromJson(Map<String, dynamic> json) {
    return AppointmentResponse(
      id:                 json['id'] as String? ?? '',
      patientId:          json['patientId'] as String? ?? '',
      patient:            json['patient'] != null ? UserSummaryResponse.fromJson(json['patient']) : null,
      doctor:             json['doctor'] != null ? UserSummaryResponse.fromJson(json['doctor']) : null,
      doctorWorkSlotId:   json['doctorWorkSlotId'] as String? ?? '',
      doctorWorkSlot:     json['doctorWorkSlot'] != null ? DoctorWorkSlotResponse.fromJson(json['doctorWorkSlot']) : null,
      slot:               json['slot'] != null ? WorkSlotResponse.fromJson(json['slot']) : null,
      room:               json['room'] != null ? ClinicRoomResponse.fromJson(json['room']) : null,
      status:             json['status'] as String? ?? '',
      diagnosis:          json['diagnosis'] as String?,
      requestedAt:        json['requestedAt'] as String?,
      cancelledBy:        json['cancelledBy'] as String?,
      cancelledAt:        json['cancelledAt'] as String?,
      cancellationReason: json['cancellationReason'] as String?,
    );
  }
}
