import 'package:flutter/material.dart';
import '../core/config/environment_config.dart';
import '../models/dto/notification_response.dart';
import '../services/abstract/notification_service_abstract.dart';
import '../services/mock/mock_notification_service.dart';
import '../services/remote/remote_notification_service.dart';

class NotificationViewModel extends ChangeNotifier {
  final NotificationServiceAbstract _service;

  NotificationViewModel({NotificationServiceAbstract? service})
      : _service = service ??
            (EnvironmentConfig.isMock
                ? MockNotificationService()
                : RemoteNotificationService()) {
    load();
  }

  List<NotificationResponse> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  bool _isMarkingAllRead = false;
  String? _errorMessage;

  List<NotificationResponse> get notifications => _notifications;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  bool get isMarkingAllRead => _isMarkingAllRead;
  String? get errorMessage => _errorMessage;

  /// Danh sách thông báo trong ngày hôm nay
  List<NotificationResponse> get todayNotifications {
    final now = DateTime.now();
    return _notifications.where((n) {
      return n.notifyTime.year == now.year &&
          n.notifyTime.month == now.month &&
          n.notifyTime.day == now.day;
    }).toList();
  }

  /// Danh sách thông báo trước đó
  List<NotificationResponse> get earlierNotifications {
    final now = DateTime.now();
    return _notifications.where((n) {
      final isToday = n.notifyTime.year == now.year &&
          n.notifyTime.month == now.month &&
          n.notifyTime.day == now.day;
      return !isToday;
    }).toList();
  }

  Future<void> load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final notifResult = await _service.getNotifications();
      final countResult = await _service.getUnreadCount();

      if (notifResult.success && notifResult.data != null) {
        _notifications = notifResult.data!;
      } else {
        _errorMessage = notifResult.message;
        _notifications = [];
      }

      if (countResult.success && countResult.data != null) {
        _unreadCount = countResult.data!;
      } else {
        _unreadCount = _notifications.where((n) => n.status.isUnread).length;
      }
    } catch (e) {
      _errorMessage = 'Không thể tải thông báo. Vui lòng thử lại sau.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refresh() => load();

  /// Đánh dấu một thông báo cụ thể là đã đọc
  Future<void> markAsRead(String notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index == -1) return;

    final target = _notifications[index];
    if (target.status == NotificationStatus.read) return;

    // Optimistic update
    _notifications[index] = target.copyWith(status: NotificationStatus.read);
    if (_unreadCount > 0) _unreadCount--;
    notifyListeners();

    final response = await _service.markRead(notificationId);
    if (!response.success) {
      // Nếu API lỗi, hoàn tác trạng thái
      _notifications[index] = target;
      _unreadCount++;
      notifyListeners();
    }
  }

  /// Đánh dấu tất cả thông báo là đã đọc
  Future<void> markAllAsRead() async {
    if (_unreadCount == 0 && _notifications.every((n) => !n.status.isUnread)) {
      return;
    }

    _isMarkingAllRead = true;
    notifyListeners();

    // Optimistic update
    final backup = List<NotificationResponse>.from(_notifications);
    final backupUnread = _unreadCount;

    _notifications = _notifications
        .map((n) => n.copyWith(status: NotificationStatus.read))
        .toList();
    _unreadCount = 0;
    notifyListeners();

    final response = await _service.markAllRead();
    if (!response.success) {
      _notifications = backup;
      _unreadCount = backupUnread;
      _errorMessage = response.message;
    }

    _isMarkingAllRead = false;
    notifyListeners();
  }
}
