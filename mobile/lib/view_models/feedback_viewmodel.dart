import 'package:flutter/foundation.dart';
import '../core/config/environment_config.dart';
import '../models/feedback_model.dart';
import '../services/abstract/feedback_service_abstract.dart';
import '../services/mock/mock_feedback_service.dart';
import '../services/remote/remote_feedback_service.dart';

/// ViewModel for UC-13: Góp ý & Phản hồi dịch vụ.
/// Quản lý form nhập liệu, validation, gửi phản hồi và tải lịch sử phản hồi.
class FeedbackViewModel extends ChangeNotifier {
  final IFeedbackService _service;

  FeedbackViewModel({IFeedbackService? service})
      : _service = service ??
            (EnvironmentConfig.isMock
                ? MockFeedbackService()
                : RemoteFeedbackService());

  // ── Form State ──────────────────────────────────────────────────────────────

  List<HospitalServiceOption> _serviceOptions = [];
  bool _isLoadingServices = false;
  bool _isSubmitting = false;
  bool _submitSuccess = false;
  String? _errorMessage;

  FeedbackDraft _draft = FeedbackDraft();

  // ── History State ───────────────────────────────────────────────────────────

  List<FeedbackItem> _myFeedbacks = [];
  bool _isLoadingHistory = false;
  String? _historyErrorMessage;

  // ── Getters ─────────────────────────────────────────────────────────────────

  List<HospitalServiceOption> get serviceOptions => _serviceOptions;
  bool get isLoadingServices => _isLoadingServices;
  bool get isSubmitting => _isSubmitting;
  bool get submitSuccess => _submitSuccess;
  String? get errorMessage => _errorMessage;

  HospitalServiceOption? get selectedService => _draft.selectedService;
  int get starRating => _draft.starRating;
  Set<FeedbackHighlight> get selectedHighlights => _draft.selectedHighlights;
  String get comment => _draft.comment;

  bool get canSubmit => _draft.isValid && !_isSubmitting;
  String get starLabel => starRatingLabel(_draft.starRating);

  List<FeedbackItem> get myFeedbacks => _myFeedbacks;
  bool get isLoadingHistory => _isLoadingHistory;
  String? get historyErrorMessage => _historyErrorMessage;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  Future<void> init() async {
    await Future.wait([
      loadServices(),
      loadMyFeedbacks(),
    ]);
  }

  Future<void> loadServices() async {
    _isLoadingServices = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _serviceOptions = await _service.getServiceCategories();
      if (_serviceOptions.isNotEmpty && _draft.selectedService == null) {
        _draft.selectedService = _serviceOptions.first;
      }
    } catch (e) {
      _errorMessage = 'Không thể tải danh mục dịch vụ.';
    } finally {
      _isLoadingServices = false;
      notifyListeners();
    }
  }

  Future<void> loadMyFeedbacks() async {
    _isLoadingHistory = true;
    _historyErrorMessage = null;
    notifyListeners();

    try {
      _myFeedbacks = await _service.getMyFeedbacks();
    } catch (e) {
      _historyErrorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoadingHistory = false;
      notifyListeners();
    }
  }

  // ── Form Actions ─────────────────────────────────────────────────────────────

  void selectService(HospitalServiceOption? option) {
    _draft.selectedService = option;
    notifyListeners();
  }

  void selectStar(int rating) {
    _draft.starRating = rating;
    notifyListeners();
  }

  void toggleHighlight(FeedbackHighlight highlight) {
    if (_draft.selectedHighlights.contains(highlight)) {
      _draft.selectedHighlights.remove(highlight);
    } else {
      _draft.selectedHighlights.add(highlight);
    }
    notifyListeners();
  }

  void updateComment(String value) {
    _draft.comment = value;
    notifyListeners();
  }

  // ── Submission ───────────────────────────────────────────────────────────────

  Future<void> submit() async {
    if (!canSubmit) return;

    _isSubmitting = true;
    _submitSuccess = false;
    _errorMessage = null;
    notifyListeners();

    try {
      final success = await _service.submitFeedback(_draft);
      if (success) {
        _submitSuccess = true;
        final currentService = _draft.selectedService;
        // Reset form nhưng giữ default service
        _draft = FeedbackDraft(selectedService: currentService);
        // Tải lại lịch sử phản hồi
        loadMyFeedbacks();
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }

  void clearSuccessFlag() {
    _submitSuccess = false;
    notifyListeners();
  }
}

