class PatientDoctorResponse {
  final String id;
  final String fullName;
  final String? phoneNumber;

  const PatientDoctorResponse({
    required this.id,
    required this.fullName,
    this.phoneNumber,
  });

  factory PatientDoctorResponse.fromJson(Map<String, dynamic> json) {
    return PatientDoctorResponse(
      id:          json['id'] as String? ?? '',
      fullName:    json['fullName'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String?,
    );
  }
}
