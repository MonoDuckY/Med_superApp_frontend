import 'package:flutter/foundation.dart';
import '../models/medical_record_model.dart';
import '../services/abstract/medical_record_service_abstract.dart';
import '../services/mock/mock_medical_record_service.dart';

class MedicalRecordDetailViewModel extends ChangeNotifier {
  final IMedicalRecordService _service;
  final String recordId;

  MedicalRecordDetailViewModel({
    required this.recordId,
    IMedicalRecordService? service,
  }) : _service = service ?? MockMedicalRecordService();

  // ── State ──────────────────────────────────────────────────────────────────
  MedicalRecordDetail? _detail;
  bool _isLoading = false;
  String? _errorMessage;

  // ── Getters ────────────────────────────────────────────────────────────────
  MedicalRecordDetail? get detail => _detail;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  bool get resultAvailable => _detail?.summary.resultAvailable ?? true;
  bool get hasPrescriptions =>
      (_detail?.prescriptions ?? []).isNotEmpty;
  bool get hasAttachedImages =>
      (_detail?.attachedImages ?? []).isNotEmpty;

  // ── Actions ────────────────────────────────────────────────────────────────
  Future<void> loadDetail() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _detail = await _service.getRecordDetail(recordId);
      if (_detail == null) {
        _errorMessage = 'Không tìm thấy hồ sơ khám này.';
      }
    } catch (e) {
      _errorMessage = 'Không thể tải chi tiết. Vui lòng thử lại.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
