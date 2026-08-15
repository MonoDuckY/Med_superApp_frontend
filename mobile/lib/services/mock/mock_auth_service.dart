import '../../core/models/api_response.dart';
import '../../models/user_model.dart';
import '../abstract/auth_service_abstract.dart';

/// Mock implementation của AuthService.
/// Dùng khi AppConstants.useMockServices = true (chưa có backend).
/// KHÔNG chứa logic business thật — chỉ trả về fake data.
class MockAuthService implements AuthServiceAbstract {
  // Fake users giả lập dữ liệu backend (dùng username thay vì email)
  static final _fakeUsers = {
    // Staff — login bằng username
    'doctor01': UserModel(
      id: 'usr_001',
      username: 'doctor01',
      fullName: 'BS. Nguyễn Văn A',
      role: 'DOCTOR',
      status: 'ACTIVE',
    ),
    'admin': UserModel(
      id: 'usr_002',
      username: 'admin',
      fullName: 'Admin Hệ Thống',
      role: 'ADMIN',
      status: 'ACTIVE',
    ),
    // Patient — login bằng số điện thoại (cũng là username)
    '0123456789': UserModel(
      id: 'usr_003',
      username: '0123456789',
      fullName: 'Nguyễn Thị C',
      role: 'PATIENT',
      status: 'ACTIVE',
      phoneNumber: '0123456789',
      patientId: 'BN000001',
    ),
  };

  UserModel? _currentUser;

  @override
  Future<ApiResponse<UserModel>> login(String username, String password) async {
    // Giả latency network
    await Future.delayed(const Duration(milliseconds: 800));

    final user = _fakeUsers[username];
    if (user != null && password == 'Admin123!') {
      _currentUser = user;
      return ApiResponse.success(user, message: 'Đăng nhập thành công');
    }

    return ApiResponse.failure(
      'Tên đăng nhập hoặc mật khẩu không đúng',
      errorCode: 'AUTH_INVALID_CREDENTIALS',
    );
  }

  @override
  Future<ApiResponse<void>> logout() async {
    await Future.delayed(const Duration(milliseconds: 300));
    _currentUser = null;
    return ApiResponse.success(null, message: 'Đã đăng xuất');
  }

  @override
  Future<ApiResponse<UserModel>> getProfile() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (_currentUser != null) {
      return ApiResponse.success(_currentUser!);
    }
    return ApiResponse.failure('Chưa đăng nhập', errorCode: 'AUTH_UNAUTHORIZED');
  }

  @override
  Future<ApiResponse<UserModel?>> requestOtp(String phoneNumber, {String? deviceId}) async {
    await Future.delayed(const Duration(milliseconds: 600));
    // Giả lập thành công
    return ApiResponse.success(null, message: 'Đã gửi OTP');
  }

  @override
  Future<ApiResponse<UserModel>> verifyOtp(String phoneNumber, String code, {String? deviceId}) async {
    await Future.delayed(const Duration(milliseconds: 800));
    // Fake verify logic: accept if code is 123456
    if (code == '123456') {
      final user = _fakeUsers.containsKey(phoneNumber)
          ? _fakeUsers[phoneNumber]!
          : UserModel(
              id: 'usr_mock_new',
              username: phoneNumber,
              fullName: 'Bệnh nhân mới',
              role: 'PATIENT',
              status: 'ACTIVE',
              phoneNumber: phoneNumber,
            );
      _currentUser = user;
      return ApiResponse.success(user, message: 'Xác thực OTP thành công');
    }
    return ApiResponse.failure('Mã OTP không hợp lệ', errorCode: 'AUTH_INVALID_OTP');
  }

  @override
  Future<ApiResponse<UserModel>> updateProfile({
    required String fullName,
    required String gender,
    required String dateOfBirth,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));
    if (_currentUser == null) {
      return ApiResponse.failure('Chưa đăng nhập', errorCode: 'AUTH_UNAUTHORIZED');
    }
    // Tạo user mới với thông tin đã cập nhật (UserModel là immutable)
    final updated = UserModel(
      id:          _currentUser!.id,
      username:    _currentUser!.username,
      role:        _currentUser!.role,
      status:      _currentUser!.status,
      patientId:   _currentUser!.patientId,
      fullName:    fullName,
      gender:      gender,
      dateOfBirth: dateOfBirth,
      phoneNumber: _currentUser!.phoneNumber,
      createdAt:   _currentUser!.createdAt,
      updatedAt:   DateTime.now().toIso8601String(),
      lastLoginAt: _currentUser!.lastLoginAt,
    );
    _currentUser = updated;
    return ApiResponse.success(updated, message: 'Cập nhật hồ sơ thành công');
  }
}
