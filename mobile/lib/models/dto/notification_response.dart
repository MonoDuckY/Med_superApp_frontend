import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

// ── Notification Status Enum ──────────────────────────────────────────────────

enum NotificationStatus {
  unread,
  read;

  static NotificationStatus fromString(String? value) {
    if (value == null) return NotificationStatus.unread;
    switch (value.toUpperCase()) {
      case 'READ':
        return NotificationStatus.read;
      case 'UNREAD':
      default:
        return NotificationStatus.unread;
    }
  }

  String get value => this == NotificationStatus.read ? 'READ' : 'UNREAD';
  bool get isUnread => this == NotificationStatus.unread;
}

// ── Notification Category Type ────────────────────────────────────────────────

enum NotificationType {
  medication,
  appointmentConfirmed,
  appointmentRescheduled,
  appointmentCancelled,
  general;

  static NotificationType fromContent(String content) {
    final lower = content.toLowerCase();
    if (lower.contains('medication reminder') || lower.contains('uống thuốc')) {
      return NotificationType.medication;
    }
    if (lower.contains('appointment rescheduled') || lower.contains('dời lịch')) {
      return NotificationType.appointmentRescheduled;
    }
    if (lower.contains('cancelled') || lower.contains('hủy')) {
      return NotificationType.appointmentCancelled;
    }
    if (lower.contains('appointment confirmed') || lower.contains('xác nhận')) {
      return NotificationType.appointmentConfirmed;
    }
    return NotificationType.general;
  }
}

// ── Notification Model DTO ────────────────────────────────────────────────────

class NotificationResponse {
  final String id;
  final String content;
  final DateTime notifyTime;
  final NotificationStatus status;

  const NotificationResponse({
    required this.id,
    required this.content,
    required this.notifyTime,
    required this.status,
  });

  factory NotificationResponse.fromJson(Map<String, dynamic> json) {
    return NotificationResponse(
      id: json['id'] as String? ?? '',
      content: json['content'] as String? ?? '',
      notifyTime: json['notifyTime'] != null
          ? DateTime.parse(json['notifyTime'] as String).toLocal()
          : DateTime.now(),
      status: NotificationStatus.fromString(json['status'] as String?),
    );
  }

  NotificationResponse copyWith({
    String? id,
    String? content,
    DateTime? notifyTime,
    NotificationStatus? status,
  }) {
    return NotificationResponse(
      id: id ?? this.id,
      content: content ?? this.content,
      notifyTime: notifyTime ?? this.notifyTime,
      status: status ?? this.status,
    );
  }

  /// Nhận diện loại thông báo dựa vào nội dung
  NotificationType get type => NotificationType.fromContent(content);

  /// Tiêu đề ngắn gọn theo từng loại
  String get displayTitle {
    switch (type) {
      case NotificationType.medication:
        return 'Nhắc nhở uống thuốc';
      case NotificationType.appointmentConfirmed:
        return 'Lịch khám đã được xác nhận';
      case NotificationType.appointmentRescheduled:
        return 'Lịch khám đã được dời';
      case NotificationType.appointmentCancelled:
        return 'Lịch khám đã bị hủy';
      case NotificationType.general:
        return 'Thông báo hệ thống';
    }
  }

  /// Icon đại diện
  IconData get icon {
    switch (type) {
      case NotificationType.medication:
        return Icons.medication_rounded;
      case NotificationType.appointmentConfirmed:
        return Icons.event_available_rounded;
      case NotificationType.appointmentRescheduled:
        return Icons.edit_calendar_rounded;
      case NotificationType.appointmentCancelled:
        return Icons.event_busy_rounded;
      case NotificationType.general:
        return Icons.notifications_active_rounded;
    }
  }

  /// Màu icon
  Color get iconColor {
    switch (type) {
      case NotificationType.medication:
        return AppColors.orange;
      case NotificationType.appointmentConfirmed:
        return AppColors.success;
      case NotificationType.appointmentRescheduled:
        return AppColors.warning;
      case NotificationType.appointmentCancelled:
        return AppColors.error;
      case NotificationType.general:
        return AppColors.primary;
    }
  }

  /// Màu nền bọc icon
  Color get iconBgColor {
    switch (type) {
      case NotificationType.medication:
        return AppColors.orange50;
      case NotificationType.appointmentConfirmed:
        return AppColors.green50;
      case NotificationType.appointmentRescheduled:
        return AppColors.amber50;
      case NotificationType.appointmentCancelled:
        return AppColors.red100;
      case NotificationType.general:
        return AppColors.sky100;
    }
  }

  /// Route đích khi click vào thông báo
  String? get targetRoute {
    switch (type) {
      case NotificationType.medication:
        return '/health/medicine-schedule';
      case NotificationType.appointmentConfirmed:
      case NotificationType.appointmentRescheduled:
      case NotificationType.appointmentCancelled:
        return '/schedule';
      case NotificationType.general:
        return null;
    }
  }

  /// Thời gian tương đối dễ đọc (Tiếng Việt)
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(notifyTime);

    if (difference.inSeconds < 60) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24 && now.day == notifyTime.day) {
      return '${difference.inHours} giờ trước';
    } else if (difference.inDays == 1 || (now.day - notifyTime.day == 1 && difference.inHours < 48)) {
      final hour = notifyTime.hour.toString().padLeft(2, '0');
      final minute = notifyTime.minute.toString().padLeft(2, '0');
      return 'Hôm qua lúc $hour:$minute';
    } else {
      final day = notifyTime.day.toString().padLeft(2, '0');
      final month = notifyTime.month.toString().padLeft(2, '0');
      final year = notifyTime.year;
      final hour = notifyTime.hour.toString().padLeft(2, '0');
      final minute = notifyTime.minute.toString().padLeft(2, '0');
      return '$day/$month/$year $hour:$minute';
    }
  }
}
