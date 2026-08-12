import 'package:shared_preferences/shared_preferences.dart';

class EnvironmentConfig {
  static const String _keyUseMockServices = 'env_use_mock_services';
  
  // Default to false unless explicitly toggled
  static bool _isMock = false;

  static bool get isMock => _isMock;

  /// Load the initial state from SharedPreferences (call this in main.dart)
  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    // Default to false if not set
    _isMock = prefs.getBool(_keyUseMockServices) ?? false;
  }

  /// Toggle and save the state (call this from Developer Settings)
  static Future<void> setMock(bool value) async {
    if (_isMock == value) return;
    _isMock = value;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyUseMockServices, value);
  }
}
