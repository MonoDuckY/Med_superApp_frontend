// User model — khớp hoàn toàn với UserResponse từ Spring Boot backend.
// Fields: id, username, role, status, patientId, fullName, gender,
//         dateOfBirth, phoneNumber, createdAt, updatedAt, lastLoginAt.
class UserModel {
  final String id;
  final String? username;
  final String role; // 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'RESEARCHER'
  final String status; // 'ACTIVE' | 'DISABLED'
  final String? patientId;
  final String? fullName;
  final String? gender;
  final String? dateOfBirth; // ISO-8601 date string (LocalDate → String)
  final String? phoneNumber;
  final String? address;
  final String? citizenIdentificationCode;
  final String? healthInsuranceCode;
  final String? medicalHistory;
  final String? currentSickness;
  final double? height;
  final double? weight;
  final String? bloodType;
  final String? createdAt; // ISO-8601 instant string
  final String? updatedAt;
  final String? lastLoginAt;

  const UserModel({
    required this.id,
    this.username,
    required this.role,
    required this.status,
    this.patientId,
    this.fullName,
    this.gender,
    this.dateOfBirth,
    this.phoneNumber,
    this.address,
    this.citizenIdentificationCode,
    this.healthInsuranceCode,
    this.medicalHistory,
    this.currentSickness,
    this.height,
    this.weight,
    this.bloodType,
    this.createdAt,
    this.updatedAt,
    this.lastLoginAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:                        json['id'] as String,
      username:                  json['username'] as String?,
      role:                      (json['role'] as String?) ?? 'PATIENT',
      status:                    (json['status'] as String?) ?? 'ACTIVE',
      patientId:                 json['patientId'] as String?,
      fullName:                  json['fullName'] as String?,
      gender:                    json['gender'] as String?,
      dateOfBirth:               json['dateOfBirth'] as String?,
      phoneNumber:               json['phoneNumber'] as String?,
      address:                   json['address'] as String?,
      citizenIdentificationCode: json['citizenIdentificationCode'] as String?,
      healthInsuranceCode:       json['healthInsuranceCode'] as String?,
      medicalHistory:            json['medicalHistory'] as String?,
      currentSickness:           json['currentSickness'] as String?,
      height:                    (json['height'] as num?)?.toDouble(),
      weight:                    (json['weight'] as num?)?.toDouble(),
      bloodType:                 json['bloodType'] as String?,
      createdAt:                 json['createdAt'] as String?,
      updatedAt:                 json['updatedAt'] as String?,
      lastLoginAt:               json['lastLoginAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id':                        id,
    'username':                  username,
    'role':                      role,
    'status':                    status,
    'patientId':                 patientId,
    'fullName':                  fullName,
    'gender':                    gender,
    'dateOfBirth':               dateOfBirth,
    'phoneNumber':               phoneNumber,
    'address':                   address,
    'citizenIdentificationCode': citizenIdentificationCode,
    'healthInsuranceCode':       healthInsuranceCode,
    'medicalHistory':            medicalHistory,
    'currentSickness':           currentSickness,
    'height':                    height,
    'weight':                    weight,
    'bloodType':                 bloodType,
    'createdAt':                 createdAt,
    'updatedAt':                 updatedAt,
    'lastLoginAt':               lastLoginAt,
  };
}
