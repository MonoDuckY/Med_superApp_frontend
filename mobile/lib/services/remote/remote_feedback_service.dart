import 'package:dio/dio.dart';
import '../../models/feedback_model.dart';
import '../abstract/feedback_service_abstract.dart';
import 'api_client.dart';

/// Triển khai thực tế của IFeedbackService kết nối tới Spring Boot Backend.
class RemoteFeedbackService implements IFeedbackService {
  final Dio _dio;

  RemoteFeedbackService({Dio? dio}) : _dio = dio ?? ApiClient.instance;

  @override
  Future<List<HospitalServiceOption>> getServiceCategories() async {
    // Trả về danh sách danh mục dịch vụ chuẩn của bệnh viện
    return HospitalServiceOption.defaultServices;
  }

  @override
  Future<bool> submitFeedback(FeedbackDraft draft) async {
    if (!draft.isValid) {
      throw Exception('Vui lòng chọn dịch vụ và đánh giá số sao.');
    }

    try {
      // Xây dựng nội dung comment kèm tags (nếu có)
      String fullContent = draft.comment.trim();
      if (draft.selectedHighlights.isNotEmpty) {
        final tagsStr = draft.selectedHighlights.map((h) => h.label).join(', ');
        if (fullContent.isNotEmpty) {
          fullContent = '[$tagsStr]\n$fullContent';
        } else {
          fullContent = '[$tagsStr]';
        }
      }

      final payload = {
        'rating': draft.starRating,
        'serviceType': draft.selectedService?.label ?? 'Dịch vụ bệnh viện',
        'content': fullContent.isNotEmpty ? fullContent : null,
      };

      final response = await _dio.post(
        '/api/patient/feedback',
        data: payload,
      );

      if (response.data != null && response.data['success'] == true) {
        return true;
      }

      final msg = response.data?['message'] ?? 'Gửi phản hồi thất bại.';
      throw Exception(msg);
    } on DioException catch (e) {
      final errorMsg = e.response?.data?['message'] ?? 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
      throw Exception(errorMsg);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<List<FeedbackItem>> getMyFeedbacks() async {
    try {
      final response = await _dio.get('/api/patient/feedback');

      if (response.data != null && response.data['success'] == true) {
        final List rawList = response.data['data'] ?? [];
        return rawList
            .map((json) => FeedbackItem.fromJson(json as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      final errorMsg = e.response?.data?['message'] ?? 'Không thể tải lịch sử phản hồi.';
      throw Exception(errorMsg);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Đã xảy ra lỗi không xác định.');
    }
  }
}
