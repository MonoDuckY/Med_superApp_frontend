import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../core/config/environment_config.dart';
import '../models/medical_record_model.dart';
import '../models/user_model.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/abstract/medical_record_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/mock/mock_medical_record_service.dart';
import '../services/remote/auth_service.dart';
import '../services/remote/remote_medical_record_service.dart';

enum MedicalRecordFilter { all, ongoing, completed }

class MedicalRecordViewModel extends ChangeNotifier {
  final IMedicalRecordService _service;
  final AuthServiceAbstract _authService;

  MedicalRecordViewModel({
    IMedicalRecordService? service,
    AuthServiceAbstract? authService,
  })  : _service = service ??
            (EnvironmentConfig.isMock
                ? MockMedicalRecordService()
                : RemoteMedicalRecordService()),
        _authService = authService ??
            ((service is MockMedicalRecordService || EnvironmentConfig.isMock)
                ? MockAuthService()
                : RemoteAuthService());

  // ── State ──────────────────────────────────────────────────────────────────
  List<MedicalRecord> _allRecords = [];
  MedicalRecordFilter _filter = MedicalRecordFilter.all;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? _user;
  UserModel? get user => _user;

  String _userName = 'Khách';
  String get userName => _userName;

  // ── Patient Info Getters ───────────────────────────────────────────────────
  String get patientCode {
    if (_user?.patientId != null && _user!.patientId!.trim().isNotEmpty) {
      return _user!.patientId!.trim();
    }
    return '';
  }

  String get dobDisplay {
    final dob = _user?.dateOfBirth ?? '';
    if (dob.isEmpty) return '';
    try {
      final parts = dob.split('-');
      if (parts.length == 3) {
        return 'Ngày sinh: ${parts[2]}/${parts[1]}/${parts[0]}';
      }
      return 'Ngày sinh: $dob';
    } catch (_) {
      return 'Ngày sinh: $dob';
    }
  }

  String get patientSubtitle {
    final hasPatientId = patientCode.isNotEmpty;
    final dob = dobDisplay;

    if (hasPatientId && dob.isNotEmpty) {
      return 'Mã BN: $patientCode  ·  $dob';
    } else if (hasPatientId) {
      return 'Mã BN: $patientCode';
    } else if (dob.isNotEmpty) {
      return dob;
    }
    return 'Bệnh nhân';
  }

  String get userInitials {
    final name = _userName.trim();
    if (name.isEmpty || name == 'Khách') return 'BN';
    final parts = name.split(RegExp(r'\s+'));
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  // ── Getters ────────────────────────────────────────────────────────────────
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  MedicalRecordFilter get currentFilter => _filter;

  /// Records after applying the active filter.
  List<MedicalRecord> get filteredRecords {
    switch (_filter) {
      case MedicalRecordFilter.all:
        return _allRecords;
      case MedicalRecordFilter.ongoing:
        return _allRecords
            .where((r) => r.status == MedicalRecordStatus.ongoing)
            .toList();
      case MedicalRecordFilter.completed:
        return _allRecords
            .where((r) => r.status == MedicalRecordStatus.completed)
            .toList();
    }
  }

  /// Records grouped by year for the timeline view.
  Map<int, List<MedicalRecord>> get recordsByYear {
    final grouped = <int, List<MedicalRecord>>{};
    for (final r in filteredRecords) {
      final year = r.dateTime.year;
      grouped.putIfAbsent(year, () => []).add(r);
    }
    // Sort years descending
    return Map.fromEntries(
      grouped.entries.toList()..sort((a, b) => b.key.compareTo(a.key)),
    );
  }

  bool get isEmpty => filteredRecords.isEmpty && !_isLoading;

  // ── Actions ────────────────────────────────────────────────────────────────
  Future<void> loadRecords() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      var name = prefs.getString(AppConstants.keyUserName) ??
          prefs.getString(AppConstants.keyUserData) ??
          'Nguyễn Văn A';
      if (RegExp(r'^\d+$').hasMatch(name.trim())) {
        name = 'Nguyễn Văn A';
      }
      _userName = name;
    } catch (_) {}

    try {
      final profileRes = await _authService.getProfile();
      if (profileRes.success && profileRes.data != null) {
        _user = profileRes.data;
        if (_user?.fullName != null && _user!.fullName!.trim().isNotEmpty) {
          _userName = _user!.fullName!.trim();
        }
      }
    } catch (_) {}

    try {
      _allRecords = await _service.getRecords();
    } catch (e) {
      _errorMessage = 'Không thể tải hồ sơ. Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setFilter(MedicalRecordFilter filter) {
    if (_filter == filter) return;
    _filter = filter;
    notifyListeners();
  }
}
