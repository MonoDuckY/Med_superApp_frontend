// App-wide constants
class AppConstants {
  AppConstants._();

  // API
  static const String baseUrl = 'https://hypertext-patchwork-anguished.ngrok-free.dev'; // Dùng Ngrok public link
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Storage keys
  static const String keyAccessToken  = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserData     = 'user_data';
}
