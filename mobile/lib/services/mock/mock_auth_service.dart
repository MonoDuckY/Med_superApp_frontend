import '../../core/models/api_response.dart';
import '../../models/user_model.dart';
import '../abstract/auth_service_abstract.dart';

/// Mock implementation của AuthService.
/// Dùng khi AppConstants.useMockServices = true (chưa có backend).
/// KHÔNG chứa logic business thật — chỉ trả về fake data.
class MockAuthService implements AuthServiceAbstract {
  // Fake users cho từng role
  static final _fakeUsers = {
    'doctor@example.com': UserModel(
      id: 'usr_001',
      email: 'doctor@example.com',
      fullName: 'BS. Nguyễn Văn A',
      role: 'DOCTOR',
    ),
    'admin@example.com': UserModel(
      id: 'usr_002',
      email: 'admin@example.com',
      fullName: 'Admin Hệ Thống',
      role: 'ADMIN',
    ),
    'researcher@example.com': UserModel(
      id: 'usr_003',
      email: 'researcher@example.com',
      fullName: 'ThS. Trần Thị B',
      role: 'RESEARCHER',
    ),
  };

  UserModel? _currentUser;

  @override
  Future<ApiResponse<UserModel>> login(String email, String password) async {
    // Giả latency network
    await Future.delayed(const Duration(milliseconds: 800));

    final user = _fakeUsers[email];
    if (user != null && password == '123456') {
      _currentUser = user;
      return ApiResponse.success(user, message: 'Đăng nhập thành công');
    }

    return ApiResponse.failure(
      'Email hoặc mật khẩu không đúng',
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
}
