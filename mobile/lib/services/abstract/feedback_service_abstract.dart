import '../../models/feedback_model.dart';

/// Abstract contract for the feedback/review service (UC-12).
/// Both mock and remote implementations must satisfy this interface.
abstract class IFeedbackService {
  /// Returns the list of completed appointments that can be reviewed.
  Future<List<CompletedAppointmentOption>> getCompletedAppointments();

  /// Submits a patient's feedback for a completed appointment.
  /// Returns `true` on success, throws on network/server errors.
  Future<bool> submitFeedback(FeedbackDraft draft);
}
