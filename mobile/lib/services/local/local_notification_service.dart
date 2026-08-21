import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../../models/dto/medicine_schedule_response.dart';

class LocalNotificationService {
  LocalNotificationService._();
  static final LocalNotificationService instance = LocalNotificationService._();

  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  static const String channelId = 'med_superapp_reminders';
  static const String channelName = 'Nhắc nhở y tế & Uống thuốc';
  static const String channelDescription =
      'Kênh thông báo nhắc nhở uống thuốc và lịch khám bệnh';

  /// Khởi tạo plugin và múi giờ
  Future<void> initialize({
    void Function(NotificationResponse)? onNotificationTap,
  }) async {
    if (_isInitialized) return;

    try {
      // Khởi tạo timezone database
      tz.initializeTimeZones();
      try {
        tz.setLocalLocation(tz.getLocation('Asia/Ho_Chi_Minh'));
      } catch (_) {
        // Fallback sang UTC nếu không tìm thấy múi giờ
        tz.setLocalLocation(tz.UTC);
      }

      // Cấu hình Android
      const androidSettings =
          AndroidInitializationSettings('@mipmap/ic_launcher');

      // Cấu hình iOS / Darwin
      const darwinSettings = DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      );

      const initSettings = InitializationSettings(
        android: androidSettings,
        iOS: darwinSettings,
      );

      await _notificationsPlugin.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: onNotificationTap,
      );

      _isInitialized = true;
      await requestPermissions();
    } catch (e) {
      debugPrint('LocalNotificationService initialize error: $e');
    }
  }

  /// Yêu cầu quyền gửi thông báo trên Android 13+ và iOS
  Future<bool> requestPermissions() async {
    try {
      final androidPlatform = _notificationsPlugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (androidPlatform != null) {
        final granted =
            await androidPlatform.requestNotificationsPermission();
        return granted ?? false;
      }

      final iosPlatform = _notificationsPlugin
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();
      if (iosPlatform != null) {
        final granted = await iosPlatform.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
        return granted ?? false;
      }
    } catch (e) {
      debugPrint('Error requesting notification permissions: $e');
    }
    return false;
  }

  /// Chi tiết cấu hình Notification
  NotificationDetails _notificationDetails() {
    const androidDetails = AndroidNotificationDetails(
      channelId,
      channelName,
      channelDescription: channelDescription,
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      icon: '@mipmap/ic_launcher',
    );

    const darwinDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    return const NotificationDetails(
      android: androidDetails,
      iOS: darwinDetails,
    );
  }

  /// Lập lịch báo thức trước 30 phút cho một cữ thuốc
  Future<bool> scheduleMedicineReminder({
    required String scheduleId,
    required String medicineName,
    required String dosage,
    required DateTime scheduledAt,
  }) async {
    if (!_isInitialized) await initialize();

    try {
      final reminderTime =
          scheduledAt.subtract(const Duration(minutes: 30));
      final now = DateTime.now();

      // Chỉ lập lịch nếu mốc báo thức còn ở trong tương lai
      if (!reminderTime.isAfter(now)) {
        return false;
      }

      final notificationId = scheduleId.hashCode.abs() % 100000;
      final tzDateTime = tz.TZDateTime.from(reminderTime, tz.local);

      await _notificationsPlugin.zonedSchedule(
        id: notificationId,
        title: '💊 Nhắc nhở uống thuốc (còn 30 phút)',
        body: 'Sắp đến giờ uống $medicineName - Liều dùng: $dosage',
        scheduledDate: tzDateTime,
        notificationDetails: _notificationDetails(),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        payload: '/health/medicine-schedule',
      );

      debugPrint(
          'Đã lập lịch chuông báo cho $medicineName vào lúc: $reminderTime (ID: $notificationId)');
      return true;
    } catch (e) {
      debugPrint('Lỗi lập lịch thông báo thuốc: $e');
      return false;
    }
  }

  /// Hủy lịch nhắc nhở của một cữ thuốc
  Future<void> cancelMedicineReminder(String scheduleId) async {
    try {
      final notificationId = scheduleId.hashCode.abs() % 100000;
      await _notificationsPlugin.cancel(id: notificationId);
      debugPrint('Đã hủy thông báo ID: $notificationId cho schedule: $scheduleId');
    } catch (e) {
      debugPrint('Lỗi hủy thông báo: $e');
    }
  }

  /// Đồng bộ toàn bộ lịch nhắc nhở từ danh sách thuốc (quét các cữ NOT_YET sắp tới)
  Future<void> syncAllMedicineReminders(
      List<MedicineScheduleResponse> schedules) async {
    if (!_isInitialized) await initialize();

    for (final schedule in schedules) {
      if (schedule.status == MedicineScheduleStatus.notYet) {
        await scheduleMedicineReminder(
          scheduleId: schedule.id,
          medicineName: schedule.medicineName,
          dosage: schedule.dosage,
          scheduledAt: schedule.scheduledAt,
        );
      } else {
        // Nếu đã uống hoặc bỏ lỡ, hủy báo thức tương ứng
        await cancelMedicineReminder(schedule.id);
      }
    }
  }

  /// Hủy toàn bộ thông báo cục bộ
  Future<void> cancelAll() async {
    await _notificationsPlugin.cancelAll();
  }
}
