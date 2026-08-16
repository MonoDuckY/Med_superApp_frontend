import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../core/models/api_response.dart';
import '../models/user_model.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../core/config/environment_config.dart';

/// ViewModel cho màn hình "Thông tin cá nhân" (UC-04).
/// Quản lý: load profile, validate input, save profile.
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

  bool _isSaving = false;
  bool get isSaving => _isSaving;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  String? _successMessage;
  String? get successMessage => _successMessage;

  /// True nếu form đang có thay đổi chưa được lưu.
  bool _isDirty = false;
  bool get isDirty => _isDirty;

  // ── Form field controllers (raw values, không bind TextField trực tiếp) ──

  String _fullName = '';
  String get fullName => _fullName;

  String _gender = '';
  String get gender => _gender;

  String _dateOfBirth = '';
  String get dateOfBirth => _dateOfBirth;

  // ── Load ──────────────────────────────────────────────────────────────────

  /// Tải thông tin user. Ưu tiên gọi service; fallback về SharedPreferences.
  Future<void> loadProfile() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final ApiResponse<UserModel> response = await _authService.getProfile();

    if (response.success && response.data != null) {
      _user = response.data;
      _syncFormFromUser();
    } else {
      // Fallback: đọc phone từ SharedPreferences và dựng UserModel giả
      final prefs = await SharedPreferences.getInstance();
      final phone = prefs.getString(AppConstants.keyUserData) ?? '';
      _user = UserModel(
        id: 'local',
        role: 'PATIENT',
        status: 'ACTIVE',
        phoneNumber: phone,
        fullName: phone.isNotEmpty ? phone : 'Bệnh nhân',
      );
      _syncFormFromUser();
    }

    _isLoading = false;
    _isDirty = false;
    notifyListeners();
  }

  /// Đồng bộ giá trị form từ UserModel hiện tại.
  void _syncFormFromUser() {
    _fullName    = _user?.fullName    ?? '';
    _gender      = _user?.gender      ?? '';
    _dateOfBirth = _user?.dateOfBirth ?? '';
  }

  // ── Form update methods ───────────────────────────────────────────────────

  void setFullName(String value) {
    _fullName = value;
    _isDirty = true;
    _errorMessage = null;
    notifyListeners();
  }

  void setGender(String value) {
    _gender = value;
    _isDirty = true;
    _errorMessage = null;
    notifyListeners();
  }

  void setDateOfBirth(String value) {
    _dateOfBirth = value;
    _isDirty = true;
    _errorMessage = null;
    notifyListeners();
  }

  // ── Validation ────────────────────────────────────────────────────────────

  String? validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Họ và tên không được để trống';
    }
    if (value.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    return null;
  }

  String? validateDateOfBirth(String? value) {
    if (value == null || value.isEmpty) return null; // optional
    try {
      final dob = DateTime.parse(value);
      if (dob.isAfter(DateTime.now())) {
        return 'Ngày sinh không được ở tương lai';
      }
    } catch (_) {
      return 'Ngày sinh không hợp lệ';
    }
    return null;
  }

  bool get isFormValid {
    return validateFullName(_fullName) == null &&
        validateDateOfBirth(_dateOfBirth) == null;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  /// Gọi service để cập nhật profile. Trả true nếu thành công.
  Future<bool> saveProfile() async {
    if (!isFormValid) return false;

    _isSaving = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    final response = await _authService.updateProfile(
      fullName:    _fullName.trim(),
      gender:      _gender,
      dateOfBirth: _dateOfBirth,
    );

    _isSaving = false;

    if (response.success && response.data != null) {
      _user = response.data;
      _isDirty = false;
      _successMessage = response.message;
    } else {
      _errorMessage = response.message;
    }

    notifyListeners();
    return response.success;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  void clearMessages() {
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  /// Hủy mọi thay đổi, reset form về giá trị gốc.
  void discardChanges() {
    _syncFormFromUser();
    _isDirty = false;
    _errorMessage = null;
    notifyListeners();
  }

  /// Trả về initials (2 chữ cái đầu) của fullName để hiển thị avatar.
  String get initials {
    final name = (_fullName.isNotEmpty ? _fullName : _user?.fullName ?? '').trim();
    if (name.isEmpty) return '?';
    final parts = name.split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  /// Format ngày sinh ISO-8601 (yyyy-MM-dd) → dd/MM/yyyy để hiển thị.
  String get formattedDateOfBirth {
    if (_dateOfBirth.isEmpty) return '';
    try {
      final parts = _dateOfBirth.split('-');
      if (parts.length != 3) return _dateOfBirth;
      return '${parts[2]}/${parts[1]}/${parts[0]}';
    } catch (_) {
      return _dateOfBirth;
    }
  }

  /// Label giới tính dễ đọc.
  String get genderLabel {
    switch (_gender) {
      case 'MALE':   return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER':  return 'Khác';
      default:       return '';
    }
  }
}
