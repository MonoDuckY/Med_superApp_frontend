import 'package:flutter/foundation.dart';
import '../models/feedback_model.dart';
import '../services/abstract/feedback_service_abstract.dart';
import '../services/mock/mock_feedback_service.dart';

/// ViewModel for UC-12: Góp ý & Phản hồi.
/// Manages form state, validation, and submission lifecycle.
class FeedbackViewModel extends ChangeNotifier {
  final IFeedbackService _service;

  FeedbackViewModel({IFeedbackService? service})
      : _service = service ?? MockFeedbackService();

  // ── State ───────────────────────────────────────────────────────────────────

  List<CompletedAppointmentOption> _appointmentOptions = [];
  bool _isLoadingAppointments = false;
  bool _isSubmitting = false;
  bool _submitSuccess = false;
  String? _errorMessage;

  // Form draft
  FeedbackDraft _draft = FeedbackDraft();

  // ── Getters ─────────────────────────────────────────────────────────────────

  List<CompletedAppointmentOption> get appointmentOptions => _appointmentOptions;
  bool get isLoadingAppointments => _isLoadingAppointments;
  bool get isSubmitting => _isSubmitting;
  bool get submitSuccess => _submitSuccess;
  String? get errorMessage => _errorMessage;

  CompletedAppointmentOption? get selectedAppointment => _draft.selectedAppointment;
  int get starRating => _draft.starRating;
  Set<FeedbackHighlight> get selectedHighlights => _draft.selectedHighlights;
  String get comment => _draft.comment;

  bool get canSubmit => _draft.isValid && !_isSubmitting;

  String get starLabel => starRatingLabel(_draft.starRating);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  Future<void> loadCompletedAppointments() async {
    _isLoadingAppointments = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _appointmentOptions = await _service.getCompletedAppointments();
    } catch (e) {
      _errorMessage = 'Không thể tải danh sách ca khám. Vui lòng thử lại.';
    } finally {
      _isLoadingAppointments = false;
      notifyListeners();
    }
  }

  // ── Form Actions ─────────────────────────────────────────────────────────────

  void selectAppointment(CompletedAppointmentOption? option) {
    _draft.selectedAppointment = option;
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
        // Clear the form but stay on screen (per spec Q3)
        _draft = FeedbackDraft();
      }
    } catch (e) {
      _errorMessage = 'Gửi phản hồi thất bại. Vui lòng thử lại.';
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
