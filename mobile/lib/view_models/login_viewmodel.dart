import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';

class LoginViewModel extends ChangeNotifier {
  // Inject service theo feature flag — đổi sang false khi backend sẵn sàng
  final AuthServiceAbstract _authService = AppConstants.useMockServices
      ? MockAuthService()
      : RemoteAuthService();

  String phoneNumber = '';
  String password = '';
  bool isPasswordVisible = false;
  bool isLoading = false;
  String? errorMessage;

  bool get isValidPassword {
    final hasUppercase = password.contains(RegExp(r'[A-Z]'));
    final hasLowercase = password.contains(RegExp(r'[a-z]'));
    final hasDigits = password.contains(RegExp(r'[0-9]'));
    return hasUppercase && hasLowercase && hasDigits && password.length >= 8;
  }

  bool get isValidPhone {
    return phoneNumber.length >= 10;
  }

  bool get isValid => isValidPhone && isValidPassword;

  void setPhoneNumber(String value) {
    phoneNumber = value;
    errorMessage = null;
    notifyListeners();
  }

  void setPassword(String value) {
    password = value;
    errorMessage = null;
    notifyListeners();
  }

  void togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    notifyListeners();
  }

  Future<void> login(BuildContext context) async {
    if (!isValid) return;

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final result = await _authService.login(phoneNumber, password);

    if (result.success && result.data != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      // Ghi nhớ username (phoneNumber) cho session
      await prefs.setString(AppConstants.keyUserData, phoneNumber);

      isLoading = false;
      notifyListeners();

      if (context.mounted) {
        context.go('/home');
      }
    } else {
      isLoading = false;
      errorMessage = result.message;
      notifyListeners();
    }
  }
}
