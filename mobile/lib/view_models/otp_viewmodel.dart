import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';

class OtpViewModel extends ChangeNotifier {
  final String phoneNumber;

  OtpViewModel({required this.phoneNumber}) {
    _startResendTimer();
  }

  // ── OTP state ────────────────────────────────────────────────────────────
  final List<String> digits = List.filled(6, '');

  String get otp => digits.join();
  bool get isComplete => otp.length == 6 && !otp.contains('');

  void setDigit(int index, String value) {
    digits[index] = value;
    notifyListeners();
  }

  void clearOtp() {
    for (int i = 0; i < digits.length; i++) {
      digits[i] = '';
    }
    notifyListeners();
  }

  // ── Loading / Error ───────────────────────────────────────────────────────
  bool isLoading = false;
  String? errorMessage;

  // ── Resend timer ──────────────────────────────────────────────────────────
  static const int _resendSeconds = 60;
  int secondsRemaining = _resendSeconds;
  bool get canResend => secondsRemaining == 0;
  Timer? _timer;

  void _startResendTimer() {
    secondsRemaining = _resendSeconds;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (secondsRemaining > 0) {
        secondsRemaining--;
        notifyListeners();
      } else {
        timer.cancel();
      }
    });
  }

  String get timerDisplay {
    final m = (secondsRemaining ~/ 60).toString().padLeft(2, '0');
    final s = (secondsRemaining % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  void resendOtp() {
    if (!canResend) return;
    // TODO: Gọi API gửi lại OTP khi backend hỗ trợ
    clearOtp();
    errorMessage = null;
    _startResendTimer();
    notifyListeners();
  }

  // ── Masked phone display ──────────────────────────────────────────────────
  /// Hiện "+84 ••• ••• 5678" từ số như "0912345678"
  String get maskedPhone {
    String n = phoneNumber.trim();
    if (n.startsWith('0') && n.length == 10) {
      n = '+84${n.substring(1)}';
    }
    if (n.length >= 4) {
      final last4 = n.substring(n.length - 4);
      return '+84 ••• ••• $last4';
    }
    return n;
  }

  // ── Verify ────────────────────────────────────────────────────────────────
  Future<void> verifyOtp(BuildContext context) async {
    if (!isComplete) return;

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    // TODO: Thay bằng lời gọi API xác thực OTP thật khi backend hỗ trợ
    // final result = await authService.verifyOtp(phoneNumber, otp);
    await Future.delayed(const Duration(milliseconds: 800));

    // Mock: bất kỳ 6 chữ số đều pass (sẽ thay bằng API response)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_logged_in', true);
    await prefs.setString(AppConstants.keyUserData, phoneNumber);

    isLoading = false;
    notifyListeners();

    if (context.mounted) {
      context.go('/home');
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
