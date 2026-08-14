import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/medical_record_model.dart';
import '../services/abstract/medical_record_service_abstract.dart';
import '../services/mock/mock_medical_record_service.dart';

enum MedicalRecordFilter { all, ongoing, completed }

class MedicalRecordViewModel extends ChangeNotifier {
  final IMedicalRecordService _service;

  MedicalRecordViewModel({IMedicalRecordService? service})
      : _service = service ?? MockMedicalRecordService();

  // ── State ──────────────────────────────────────────────────────────────────
  List<MedicalRecord> _allRecords = [];
  MedicalRecordFilter _filter = MedicalRecordFilter.all;
  bool _isLoading = false;
  String? _errorMessage;

  String _userName = 'Khách';
  String get userName => _userName;

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
