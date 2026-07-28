import '../../core/models/api_response.dart';
import '../../models/user_model.dart';

/// Interface định nghĩa contract cho Authentication service.
/// Cả MockAuthService và RemoteAuthService đều phải implement interface này.
abstract class AuthServiceAbstract {
  Future<ApiResponse<UserModel>> login(String username, String password);
  Future<ApiResponse<void>> logout();
  Future<ApiResponse<UserModel>> getProfile();
  Future<ApiResponse<UserModel?>> requestOtp(String phoneNumber, {String? deviceId});
  Future<ApiResponse<UserModel>> verifyOtp(String phoneNumber, String code, {String? deviceId});
}
