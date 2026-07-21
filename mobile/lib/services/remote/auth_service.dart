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
  Future<ApiResponse<UserModel>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
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

  @override
  Future<ApiResponse<void>> logout() async {
    try {
      final response = await _dio.post('/auth/logout');
      return ApiResponse.fromJson(response.data, null);
    } on DioException catch (e) {
      return ApiResponse.failure(e.message ?? 'Lỗi kết nối');
    }
  }

  @override
  Future<ApiResponse<UserModel>> getProfile() async {
    try {
      final response = await _dio.get('/users/me');
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
