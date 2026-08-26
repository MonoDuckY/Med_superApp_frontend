import '../abstract/feedback_service_abstract.dart';
import '../../models/feedback_model.dart';

/// Mock implementation của IFeedbackService.
class MockFeedbackService implements IFeedbackService {
  final List<FeedbackItem> _mockFeedbacks = [
    const FeedbackItem(
      feedbackId: 'fb-001',
      senderId: 'patient-001',
      receiverId: 'staff-001',
      content: '[Bác sĩ tận tâm, Giải thích rõ ràng]\nBác sĩ tư vấn rất kỹ lưỡng và ân cần.',
      status: 'RESPONDED',
      rating: 5,
      serviceType: 'Chất lượng khám chữa bệnh',
      response: 'Cảm ơn quý khách đã tin tưởng và gửi phản hồi. Chúng tôi sẽ tiếp tục duy trì chất lượng phục vụ.',
    ),
    const FeedbackItem(
      feedbackId: 'fb-002',
      senderId: 'patient-001',
      receiverId: null,
      content: '[Cơ sở vật chất tốt]\nPhòng khám sạch sẽ, máy lạnh mát mẻ.',
      status: 'SUBMITTED',
      rating: 4,
      serviceType: 'Cơ sở vật chất & Trang thiết bị',
      response: null,
    ),
  ];

  @override
  Future<List<HospitalServiceOption>> getServiceCategories() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return HospitalServiceOption.defaultServices;
  }

  @override
  Future<bool> submitFeedback(FeedbackDraft draft) async {
    await Future.delayed(const Duration(milliseconds: 800));

    String fullContent = draft.comment.trim();
    if (draft.selectedHighlights.isNotEmpty) {
      final tagsStr = draft.selectedHighlights.map((h) => h.label).join(', ');
      if (fullContent.isNotEmpty) {
        fullContent = '[$tagsStr]\n$fullContent';
      } else {
        fullContent = '[$tagsStr]';
      }
    }

    _mockFeedbacks.insert(
      0,
      FeedbackItem(
        feedbackId: 'fb-${DateTime.now().millisecondsSinceEpoch}',
        senderId: 'patient-001',
        receiverId: null,
        content: fullContent,
        status: 'SUBMITTED',
        rating: draft.starRating,
        serviceType: draft.selectedService?.label ?? 'Dịch vụ bệnh viện',
        response: null,
      ),
    );
    return true;
  }

  @override
  Future<List<FeedbackItem>> getMyFeedbacks() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.unmodifiable(_mockFeedbacks);
  }
}

