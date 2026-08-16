import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/device_utils.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../core/config/environment_config.dart';
class LoginViewModel extends ChangeNotifier {
  String phoneNumber = '';
  bool isLoading = false;
  String? errorMessage;

  AuthServiceAbstract _authService = EnvironmentConfig.isMock 
      ? MockAuthService() 
      : RemoteAuthService();

  void updateMockState() {
    _authService = EnvironmentConfig.isMock 
        ? MockAuthService() 
        : RemoteAuthService();
    notifyListeners();
  }

  bool get isValidPhone {
    // Chấp nhận 10 chữ số bắt đầu bằng 0, hoặc định dạng +84
    final cleaned = phoneNumber.replaceAll(RegExp(r'[\s\-()]'), '');
    return RegExp(r'^(0\d{9}|\+84\d{9})$').hasMatch(cleaned);
  }

  bool get isValid => isValidPhone;

  void setPhoneNumber(String value) {
    phoneNumber = value;
    errorMessage = null;
    notifyListeners();
  }

  /// Điều hướng sang màn OTP.
  /// Khi backend hỗ trợ OTP, gọi API gửi SMS tại đây trước khi navigate.
  Future<void> requestOtp(BuildContext context) async {
    if (!isValid) return;

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final deviceId = await DeviceUtils.getDeviceId();
    final response = await _authService.requestOtp(phoneNumber, deviceId: deviceId);

    isLoading = false;
    notifyListeners();

    if (response.success) {
      if (response.data != null) {
        // Thiết bị đã được tin cậy, đăng nhập thành công luôn
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('is_logged_in', true);
        await prefs.setBool('is_dev_login', false);
        await prefs.setString(AppConstants.keyUserData, phoneNumber);
        if (context.mounted) {
          context.go('/home');
        }
      } else {
        if (context.mounted) {
          // Encode số điện thoại vào path parameter
          final encoded = Uri.encodeComponent(phoneNumber.trim());
          context.push('/otp/$encoded');
        }
      }
    } else {
      errorMessage = response.message;
      notifyListeners();
    }
  }

  /// [DEV ONLY] Bypass login hoàn toàn — không gọi API, không cần OTP.
  /// Chỉ hoạt động khi chạy debug build (kDebugMode).
  Future<void> devBypassLogin(BuildContext context) async {
    if (!kDebugMode) return;

    isLoading = true;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', true);
    await prefs.setBool('is_dev_login', true);
    await prefs.setString(AppConstants.keyUserData, '0123456789');

    isLoading = false;
    notifyListeners();

    if (context.mounted) {
      context.go('/home');
    }
  }
}
