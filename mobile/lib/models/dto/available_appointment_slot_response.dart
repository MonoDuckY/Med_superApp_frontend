class AvailableAppointmentSlotResponse {
  final String doctorWorkSlotId;
  final String doctorId;
  final String doctorName;
  final String workDate; // ISO format YYYY-MM-DD
  final String slotId;
  final String roomId;
  final String startAt; // ISO-8601 instant string
  final String endAt;   // ISO-8601 instant string

  const AvailableAppointmentSlotResponse({
    required this.doctorWorkSlotId,
    required this.doctorId,
    required this.doctorName,
    required this.workDate,
    required this.slotId,
    required this.roomId,
    required this.startAt,
    required this.endAt,
  });

  factory AvailableAppointmentSlotResponse.fromJson(Map<String, dynamic> json) {
    return AvailableAppointmentSlotResponse(
      doctorWorkSlotId: json['doctorWorkSlotId'] as String? ?? '',
      doctorId:         json['doctorId'] as String? ?? '',
      doctorName:       json['doctorName'] as String? ?? '',
      workDate:         json['workDate'] as String? ?? '',
      slotId:           json['slotId'] as String? ?? '',
      roomId:           json['roomId'] as String? ?? '',
      startAt:          json['startAt'] as String? ?? '',
      endAt:            json['endAt'] as String? ?? '',
    );
  }
}
