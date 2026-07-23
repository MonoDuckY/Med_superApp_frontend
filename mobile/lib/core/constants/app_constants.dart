// App-wide constants
class AppConstants {
  AppConstants._();

  // API
  static const String baseUrl = 'http://10.0.2.2:8080/api/v1'; // Android emulator → localhost
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Storage keys
  static const String keyAccessToken  = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserData     = 'user_data';

  // Feature flags
  static const bool useMockServices = false; // ← Đổi thành false khi backend sẵn sàng
}
