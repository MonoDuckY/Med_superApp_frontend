import '../../models/feedback_model.dart';

/// Abstract contract cho feedback/review service (UC-13).
/// Cả Mock và Remote implementation đều phải tuân thủ interface này.
abstract class IFeedbackService {
  /// Lấy danh sách danh mục dịch vụ bệnh viện để đánh giá.
  Future<List<HospitalServiceOption>> getServiceCategories();

  /// Gửi phản hồi đánh giá của bệnh nhân.
  /// Trả về `true` khi thành công, ném ngoại lệ khi có lỗi.
  Future<bool> submitFeedback(FeedbackDraft draft);

  /// Lấy danh sách lịch sử phản hồi của bệnh nhân cùng câu trả lời của nhân viên.
  Future<List<FeedbackItem>> getMyFeedbacks();
}

