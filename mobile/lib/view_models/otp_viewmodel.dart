import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../core/utils/device_utils.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../core/config/environment_config.dart';

class OtpViewModel extends ChangeNotifier {
  final String phoneNumber;
  final AuthServiceAbstract _authService = EnvironmentConfig.isMock 
      ? MockAuthService() 
      : RemoteAuthService();

  OtpViewModel({required this.phoneNumber}) {
    _startResendTimer();
  }

  // ── OTP state ────────────────────────────────────────────────────────────
  final List<String> digits = List.filled(6, '');

  String get otp => digits.join();
  bool get isComplete => otp.length == 6 && !digits.contains('');

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

  Future<void> resendOtp() async {
    if (!canResend) return;
    
    clearOtp();
    errorMessage = null;
    notifyListeners();

    final deviceId = await DeviceUtils.getDeviceId();
    final response = await _authService.requestOtp(phoneNumber, deviceId: deviceId);
    if (!response.success) {
      errorMessage = response.message;
    }
    
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
  Future<bool> verifyOtp() async {
    if (!isComplete) return false;

    isLoading = true;
    errorMessage = null;
    notifyListeners();

    final deviceId = await DeviceUtils.getDeviceId();
    final response = await _authService.verifyOtp(phoneNumber, otp, deviceId: deviceId);

    if (response.success) {
      final user = response.data;
      final name = (user?.fullName != null && user!.fullName!.isNotEmpty)
          ? user.fullName!
          : 'Nguyễn Văn A';

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_logged_in', true);
      await prefs.setBool('is_dev_login', false);
      await prefs.setString(AppConstants.keyUserData, phoneNumber);
      await prefs.setString(AppConstants.keyUserPhone, phoneNumber);
      await prefs.setString(AppConstants.keyUserName, name);

      isLoading = false;
      notifyListeners();
      return true;
    } else {
      isLoading = false;
      errorMessage = response.message;
      notifyListeners();
      return false;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
