import 'package:dio/dio.dart';

class ApiService {
  late final Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: const Duration(seconds: 5),
      receiveTimeout: const Duration(seconds: 3),
    ));
    
    // Add interceptors for logging or auth token
    _dio.interceptors.add(LogInterceptor(responseBody: true));
  }

  Dio get client => _dio;
}
