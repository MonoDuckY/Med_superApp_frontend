// App-wide constants
class AppConstants {
  AppConstants._();

  // API
  static const String baseUrl = 'http://127.0.0.1:8080'; // Qua cáp USB bằng adb reverse
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Storage keys
  static const String keyAccessToken  = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserData     = 'user_data';

  // Feature flags
  static const bool useMockServices = false; // ← Đổi thành true để dùng mock khi không có backend
}
