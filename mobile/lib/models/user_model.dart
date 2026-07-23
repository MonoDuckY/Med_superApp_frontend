// User model — khớp hoàn toàn với UserResponse từ Spring Boot backend.
// Fields: id, username, role, status, patientId, fullName, gender,
//         dateOfBirth, phoneNumber, createdAt, updatedAt, lastLoginAt.
class UserModel {
  final String id;
  final String username;
  final String role; // 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'RESEARCHER'
  final String status; // 'ACTIVE' | 'DISABLED'
  final String? patientId;
  final String? fullName;
  final String? gender;
  final String? dateOfBirth; // ISO-8601 date string (LocalDate → String)
  final String? phoneNumber;
  final String? createdAt; // ISO-8601 instant string
  final String? updatedAt;
  final String? lastLoginAt;

  const UserModel({
    required this.id,
    required this.username,
    required this.role,
    required this.status,
    this.patientId,
    this.fullName,
    this.gender,
    this.dateOfBirth,
    this.phoneNumber,
    this.createdAt,
    this.updatedAt,
    this.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:          json['id'] as String,
      username:    json['username'] as String,
      role:        (json['role'] as String?) ?? 'PATIENT',
      status:      (json['status'] as String?) ?? 'ACTIVE',
      patientId:   json['patientId'] as String?,
      fullName:    json['fullName'] as String?,
      gender:      json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      createdAt:   json['createdAt'] as String?,
      updatedAt:   json['updatedAt'] as String?,
      lastLoginAt: json['lastLoginAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id':          id,
    'username':    username,
    'role':        role,
    'status':      status,
    'patientId':   patientId,
    'fullName':    fullName,
    'gender':      gender,
    'dateOfBirth': dateOfBirth,
    'phoneNumber': phoneNumber,
    'createdAt':   createdAt,
    'updatedAt':   updatedAt,
    'lastLoginAt': lastLoginAt,
  };
}
