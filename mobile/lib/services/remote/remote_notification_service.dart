import 'package:dio/dio.dart';
import '../../core/models/api_response.dart';
import '../../models/dto/notification_response.dart';
import '../abstract/notification_service_abstract.dart';
import 'api_client.dart';

class RemoteNotificationService implements NotificationServiceAbstract {
  final Dio _dio;

  RemoteNotificationService({Dio? dio}) : _dio = dio ?? ApiClient.instance;

  @override
  Future<ApiResponse<List<NotificationResponse>>> getNotifications() async {
    try {
      final response = await _dio.get('/api/patient/notifications');
      return ApiResponse<List<NotificationResponse>>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => (json as List)
            .map((e) => NotificationResponse.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Không thể tải danh sách thông báo.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<int>> getUnreadCount() async {
    try {
      final response = await _dio.get('/api/patient/notifications/unread-count');
      return ApiResponse<int>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => (json as num).toInt(),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Không thể lấy số lượng thông báo.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<NotificationResponse>> markRead(String notificationId) async {
    try {
      final response = await _dio.patch('/api/patient/notifications/$notificationId/read');
      return ApiResponse<NotificationResponse>.fromJson(
        response.data as Map<String, dynamic>,
        (json) => NotificationResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Không thể đánh dấu đã đọc.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<void>> markAllRead() async {
    try {
      final response = await _dio.patch('/api/patient/notifications/read-all');
      return ApiResponse<void>.fromJson(
        response.data as Map<String, dynamic>,
        null,
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Không thể đánh dấu tất cả đã đọc.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }
}
