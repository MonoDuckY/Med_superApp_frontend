import 'package:dio/dio.dart';
import '../../core/constants/app_constants.dart';

/// HTTP client được cấu hình sẵn với base URL và auth interceptor.
/// Sử dụng thông qua các service class, không gọi trực tiếp.
class ApiClient {
  ApiClient._();

  static Dio? _instance;

  static Dio get instance {
    _instance ??= _createDio();
    return _instance!;
  }

  static Dio _createDio() {
    final dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: AppConstants.connectTimeout,
      receiveTimeout: AppConstants.receiveTimeout,
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.addAll([
      _AuthInterceptor(),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
      ),
    ]);

    return dio;
  }
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // TODO: Lấy token từ SharedPreferences và gắn vào header
    // final token = await storage.read(AppConstants.keyAccessToken);
    // if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) {
      // TODO: Refresh token logic
    }
    handler.next(err);
  }
}
