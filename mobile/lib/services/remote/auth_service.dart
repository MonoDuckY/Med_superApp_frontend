import 'package:dio/dio.dart';
import '../../core/models/api_response.dart';
import '../../models/user_model.dart';
import '../abstract/auth_service_abstract.dart';
import '../remote/api_client.dart';

/// Real implementation của AuthService — gọi Spring Boot backend qua Dio.
/// Chỉ được dùng khi AppConstants.useMockServices = false.
class RemoteAuthService implements AuthServiceAbstract {
  final Dio _dio = ApiClient.instance;

  @override
  Future<ApiResponse<UserModel>> login(String username, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username, // Khớp với LoginRequest.username trên backend
        'password': password,
      });
      // Backend trả ApiResponse<AuthResponse> — data chứa accessToken, refreshToken, user
      final apiResp = ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) {
          final map = json as Map<String, dynamic>;
          // Lưu token vào ApiClient để interceptor dùng
          ApiClient.saveTokens(
            accessToken:  map['accessToken'] as String,
            refreshToken: map['refreshToken'] as String,
          );
          // Trả về UserModel từ nested user object
          return UserModel.fromJson(map['user'] as Map<String, dynamic>);
        },
      );
      return apiResp;
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi kết nối',
        errorCode: e.response?.data?['errorCode'],
      );
    }
  }

  @override
  Future<ApiResponse<void>> logout() async {
    try {
      final refreshToken = await ApiClient.getRefreshToken();
      final response = await _dio.post('/auth/logout', data: {
        'refreshToken': refreshToken, // Backend bắt buộc có field này để revoke
      });
      await ApiClient.clearTokens();
      return ApiResponse.fromJson(response.data, null);
    } on DioException catch (e) {
      return ApiResponse.failure(e.message ?? 'Lỗi kết nối');
    }
  }

  @override
  Future<ApiResponse<UserModel>> getProfile() async {
    try {
      final response = await _dio.get('/auth/me');
      return ApiResponse.fromJson(
        response.data as Map<String, dynamic>,
        (json) => UserModel.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi kết nối',
        errorCode: e.response?.data?['errorCode'],
      );
    }
  }
}
