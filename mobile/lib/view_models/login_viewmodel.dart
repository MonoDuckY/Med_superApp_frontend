import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants/app_constants.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';

class LoginViewModel extends ChangeNotifier {
  String phoneNumber = '';
  bool isLoading = false;
  String? errorMessage;

  final AuthServiceAbstract _authService = AppConstants.useMockServices 
      ? MockAuthService() 
      : RemoteAuthService();

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

    final response = await _authService.requestOtp(phoneNumber);

    isLoading = false;
    notifyListeners();

    if (response.success) {
      if (context.mounted) {
        // Encode số điện thoại vào path parameter
        final encoded = Uri.encodeComponent(phoneNumber.trim());
        context.push('/otp/$encoded');
      }
    } else {
      errorMessage = response.message;
      notifyListeners();
    }
  }
}
