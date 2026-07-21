// Đây là model placeholder. 
// Team sẽ điền đầy đủ fields khi Backend xác nhận API contract.
class UserModel {
  final String id;
  final String email;
  final String fullName;
  final String role; // 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'RESEARCHER'
  final String? avatarUrl;

  const UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:        json['id'] as String,
      email:     json['email'] as String,
      fullName:  json['fullName'] as String,
      role:      json['role'] as String,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id':        id,
    'email':     email,
    'fullName':  fullName,
    'role':      role,
    'avatarUrl': avatarUrl,
  };
}
