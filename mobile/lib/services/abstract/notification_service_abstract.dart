import '../../core/models/api_response.dart';
import '../../models/dto/notification_response.dart';

abstract class NotificationServiceAbstract {
  /// Lấy danh sách thông báo của bệnh nhân hiện tại (sắp xếp mới nhất trước)
  Future<ApiResponse<List<NotificationResponse>>> getNotifications();

  /// Lấy số lượng thông báo chưa đọc
  Future<ApiResponse<int>> getUnreadCount();

  /// Đánh dấu 1 thông báo là đã đọc
  Future<ApiResponse<NotificationResponse>> markRead(String notificationId);

  /// Đánh dấu tất cả thông báo là đã đọc
  Future<ApiResponse<void>> markAllRead();
}
