import '../../core/models/api_response.dart';
import '../../models/dto/notification_response.dart';
import '../abstract/notification_service_abstract.dart';

class MockNotificationService implements NotificationServiceAbstract {
  static List<NotificationResponse> _mockData = [
    NotificationResponse(
      id: 'notif-1',
      content:
          'Medication reminder: Paracetamol 500mg, dosage 1 viên sau ăn, scheduled at 15/08/2026 12:30, status NOT_YET.',
      notifyTime: DateTime.now().subtract(const Duration(minutes: 15)),
      status: NotificationStatus.unread,
    ),
    NotificationResponse(
      id: 'notif-2',
      content:
          'Appointment confirmed for 18/08/2026 09:00. Status: CONFIRMED.',
      notifyTime: DateTime.now().subtract(const Duration(hours: 2)),
      status: NotificationStatus.unread,
    ),
    NotificationResponse(
      id: 'notif-3',
      content:
          'Appointment rescheduled to 20/08/2026 14:30. Status: CONFIRMED.',
      notifyTime: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
      status: NotificationStatus.read,
    ),
    NotificationResponse(
      id: 'notif-4',
      content:
          'Medication reminder: Amoxicillin 500mg, dosage 1 viên, scheduled at 14/08/2026 08:00, status TAKEN.',
      notifyTime: DateTime.now().subtract(const Duration(days: 1, hours: 8)),
      status: NotificationStatus.read,
    ),
  ];

  @override
  Future<ApiResponse<List<NotificationResponse>>> getNotifications() async {
    await Future.delayed(const Duration(milliseconds: 350));
    // Sắp xếp mới nhất trước
    final sorted = List<NotificationResponse>.from(_mockData)
      ..sort((a, b) => b.notifyTime.compareTo(a.notifyTime));
    return ApiResponse.success(sorted);
  }

  @override
  Future<ApiResponse<int>> getUnreadCount() async {
    await Future.delayed(const Duration(milliseconds: 150));
    final count = _mockData.where((n) => n.status.isUnread).length;
    return ApiResponse.success(count);
  }

  @override
  Future<ApiResponse<NotificationResponse>> markRead(String notificationId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final idx = _mockData.indexWhere((n) => n.id == notificationId);
    if (idx != -1) {
      final updated = _mockData[idx].copyWith(status: NotificationStatus.read);
      _mockData[idx] = updated;
      return ApiResponse.success(updated);
    }
    return ApiResponse.failure('Thông báo không tồn tại.');
  }

  @override
  Future<ApiResponse<void>> markAllRead() async {
    await Future.delayed(const Duration(milliseconds: 250));
    _mockData = _mockData
        .map((n) => n.copyWith(status: NotificationStatus.read))
        .toList();
    return ApiResponse.success(null);
  }
}
