import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../core/models/api_response.dart';
import '../models/user_model.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../core/config/environment_config.dart';

/// ViewModel cho màn hình "Thông tin cá nhân / Hồ sơ y tế" (UC-05: View Personal Medical Profile).
/// Chế độ chỉ xem (Read-only), đồng bộ trực tiếp với Backend API / Mock.
class ProfileViewModel extends ChangeNotifier {
  final AuthServiceAbstract _authService;

  ProfileViewModel()
      : _authService = EnvironmentConfig.isMock
            ? MockAuthService()
            : RemoteAuthService();

  // ── State ─────────────────────────────────────────────────────────────────

  UserModel? _user;
  UserModel? get user => _user;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  // ── Load Profile ──────────────────────────────────────────────────────────

  /// Tải thông tin hồ sơ cá nhân.
  Future<void> loadProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final ApiResponse<UserModel> response = await _authService.getProfile();

    if (response.success && response.data != null) {
      _user = response.data;
      if (_user?.fullName != null && _user!.fullName!.isNotEmpty) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.keyUserName, _user!.fullName!);
      }
    } else {
      // Fallback khi offline / cache local
      final prefs = await SharedPreferences.getInstance();
      final phone = prefs.getString(AppConstants.keyUserPhone) ??
          prefs.getString(AppConstants.keyUserData) ??
          '0123456789';
      var name = prefs.getString(AppConstants.keyUserName) ?? 'Nguyễn Văn A';
      if (RegExp(r'^\d+$').hasMatch(name.trim())) {
        name = 'Nguyễn Văn A';
      }
      _user = UserModel(
        id: 'local',
        role: 'PATIENT',
        status: 'ACTIVE',
        phoneNumber: phone,
        fullName: name,
        gender: 'MALE',
        dateOfBirth: '1995-08-15',
      );
    }

    _isLoading = false;
    notifyListeners();
  }

  // ── Formatted Getters for UI ──────────────────────────────────────────────

  String get fullName => _user?.fullName ?? '';
  String get phoneNumber => _user?.phoneNumber ?? '';
  String get address => _user?.address ?? '';
  String get citizenId => _user?.citizenIdentificationCode ?? '';
  String get healthInsuranceCode => _user?.healthInsuranceCode ?? '';
  bool get isActive => (_user?.status ?? 'ACTIVE') == 'ACTIVE';

  /// Trả về initials (2 chữ cái đầu) của fullName để hiển thị avatar tròn.
  String get initials {
    final name = fullName.trim();
    if (name.isEmpty) return 'BN';
    final parts = name.split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  /// Format ngày sinh ISO-8601 (yyyy-MM-dd) → dd/MM/yyyy để hiển thị.
  String get formattedDateOfBirth {
    final dob = _user?.dateOfBirth ?? '';
    if (dob.isEmpty) return 'Chưa cập nhật';
    try {
      final parts = dob.split('-');
      if (parts.length != 3) return dob;
      return '${parts[2]}/${parts[1]}/${parts[0]}';
    } catch (_) {
      return dob;
    }
  }

  /// Nhãn hiển thị giới tính thân thiện.
  String get genderLabel {
    final g = (_user?.gender ?? '').trim().toUpperCase();
    if (g == 'MALE' || g == 'NAM') return 'Nam';
    if (g == 'FEMALE' || g == 'NỮ' || g == 'NU') return 'Nữ';
    if (g == 'OTHER' || g == 'KHÁC' || g == 'KHAC') return 'Khác';
    if (g.isNotEmpty) return _user!.gender!;
    return 'Chưa cập nhật';
  }

  static String normalizeGender(String? val) {
    if (val == null || val.trim().isEmpty) return '';
    final lower = val.trim().toLowerCase();
    if (lower == 'male' || lower == 'nam' || lower == 'm') return 'MALE';
    if (lower == 'female' || lower == 'nữ' || lower == 'nu' || lower == 'f') return 'FEMALE';
    if (lower == 'other' || lower == 'khác' || lower == 'khac') return 'OTHER';
    if (val == 'MALE' || val == 'FEMALE' || val == 'OTHER') return val;
    return 'OTHER';
  }
}
