import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LoginViewModel extends ChangeNotifier {
  String phoneNumber = '';
  bool isLoading = false;
  String? errorMessage;

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

    // TODO: Gọi API gửi OTP qua SMS khi backend hỗ trợ
    // final result = await authService.sendOtp(phoneNumber);
    await Future.delayed(const Duration(milliseconds: 600)); // Giả latency

    isLoading = false;
    notifyListeners();

    if (context.mounted) {
      // Encode số điện thoại vào path parameter
      final encoded = Uri.encodeComponent(phoneNumber.trim());
      context.push('/otp/$encoded');
    }
  }
}
