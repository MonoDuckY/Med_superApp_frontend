import 'package:flutter_dotenv/flutter_dotenv.dart';

// App-wide constants
class AppConstants {
  AppConstants._();

  // API
  static String get baseUrl => dotenv.env['API_URL'] ?? 'http://10.0.2.2:8080';
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 15);

  // Storage keys
  static const String keyAccessToken  = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserData     = 'user_data';
  static const String keyUserName     = 'user_name';
  static const String keyUserPhone    = 'user_phone';
}
