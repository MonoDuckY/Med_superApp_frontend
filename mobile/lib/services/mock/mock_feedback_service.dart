import '../abstract/feedback_service_abstract.dart';
import '../../models/feedback_model.dart';

/// Mock implementation of IFeedbackService.
/// Returns hardcoded completed appointments and simulates a 1s API delay on submit.
class MockFeedbackService implements IFeedbackService {
  @override
  Future<List<CompletedAppointmentOption>> getCompletedAppointments() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 600));

    return [
      CompletedAppointmentOption(
        id: 'appt-001',
        specialty: 'Nội tổng quát',
        doctorName: 'BS. Nguyễn Văn Hùng',
        completedAt: DateTime(2026, 7, 28, 9, 30),
      ),
      CompletedAppointmentOption(
        id: 'appt-002',
        specialty: 'Tim mạch',
        doctorName: 'BS. Trần Thị Mai',
        completedAt: DateTime(2026, 7, 15, 14, 0),
      ),
      CompletedAppointmentOption(
        id: 'appt-003',
        specialty: 'Tai mũi họng',
        doctorName: 'BS. Lê Minh Tuấn',
        completedAt: DateTime(2026, 6, 20, 10, 0),
      ),
    ];
  }

  @override
  Future<bool> submitFeedback(FeedbackDraft draft) async {
    // Simulate network delay for submission
    await Future.delayed(const Duration(milliseconds: 1000));

    // Always succeeds in mock mode
    return true;
  }
}
