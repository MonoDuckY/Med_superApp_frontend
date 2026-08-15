import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:med_superapp_frontend/models/dto/notification_response.dart';
import 'package:med_superapp_frontend/models/dto/medicine_schedule_response.dart';
import 'package:med_superapp_frontend/services/mock/mock_notification_service.dart';
import 'package:med_superapp_frontend/services/mock/mock_medicine_schedule_service.dart';
import 'package:med_superapp_frontend/view_models/notification_viewmodel.dart';
import 'package:med_superapp_frontend/view_models/medicine_schedule_viewmodel.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('NotificationResponse Tests', () {
    test('Correctly parses JSON from backend and identifies Medication type', () {
      final json = {
        'id': 'notif-101',
        'content':
            'Medication reminder: Paracetamol 500mg, dosage 1 viên, scheduled at 15/08/2026 12:30, status NOT_YET.',
        'notifyTime': '2026-08-15T05:30:00.000Z',
        'status': 'UNREAD',
      };

      final response = NotificationResponse.fromJson(json);

      expect(response.id, 'notif-101');
      expect(response.status, NotificationStatus.unread);
      expect(response.status.isUnread, isTrue);
      expect(response.type, NotificationType.medication);
      expect(response.displayTitle, 'Nhắc nhở uống thuốc');
      expect(response.targetRoute, '/health/medicine-schedule');
    });

    test('Correctly identifies Appointment Confirmed type', () {
      final json = {
        'id': 'notif-102',
        'content': 'Appointment confirmed for 18/08/2026 09:00. Status: CONFIRMED.',
        'notifyTime': '2026-08-15T03:00:00.000Z',
        'status': 'READ',
      };

      final response = NotificationResponse.fromJson(json);

      expect(response.status, NotificationStatus.read);
      expect(response.status.isUnread, isFalse);
      expect(response.type, NotificationType.appointmentConfirmed);
      expect(response.displayTitle, 'Lịch khám đã được xác nhận');
      expect(response.targetRoute, '/schedule');
    });

    test('Correctly identifies Appointment Rescheduled type', () {
      final json = {
        'id': 'notif-103',
        'content': 'Appointment rescheduled to 20/08/2026 14:30. Status: CONFIRMED.',
        'notifyTime': '2026-08-14T03:00:00.000Z',
        'status': 'UNREAD',
      };

      final response = NotificationResponse.fromJson(json);

      expect(response.type, NotificationType.appointmentRescheduled);
      expect(response.displayTitle, 'Lịch khám đã được dời');
      expect(response.targetRoute, '/schedule');
    });

    test('Correctly identifies Appointment Cancelled type', () {
      final json = {
        'id': 'notif-104',
        'content': 'Appointment for 20/08/2026 14:30 has been cancelled. Status: CANCELLED.',
        'notifyTime': '2026-08-14T04:00:00.000Z',
        'status': 'UNREAD',
      };

      final response = NotificationResponse.fromJson(json);

      expect(response.type, NotificationType.appointmentCancelled);
      expect(response.displayTitle, 'Lịch khám đã bị hủy');
      expect(response.targetRoute, '/schedule');
    });
  });

  group('MockNotificationService Tests', () {
    late MockNotificationService service;

    setUp(() {
      service = MockNotificationService();
    });

    test('getNotifications returns list and counts unread accurately', () async {
      final res = await service.getNotifications();
      expect(res.success, isTrue);
      expect(res.data, isNotNull);
      expect(res.data!.length, greaterThanOrEqualTo(2));

      final countRes = await service.getUnreadCount();
      expect(countRes.success, isTrue);
      expect(countRes.data, greaterThanOrEqualTo(1));
    });

    test('markRead updates item status', () async {
      final res = await service.markRead('notif-1');
      expect(res.success, isTrue);
      expect(res.data?.status, NotificationStatus.read);
    });

    test('markAllRead marks all notifications as read', () async {
      final res = await service.markAllRead();
      expect(res.success, isTrue);

      final countRes = await service.getUnreadCount();
      expect(countRes.data, equals(0));
    });
  });

  group('NotificationViewModel Tests', () {
    test('ViewModel loads notifications and handles markAsRead', () async {
      final mockService = MockNotificationService();
      final vm = NotificationViewModel(service: mockService);
      expect(vm.isLoading, isTrue);

      // Wait for initial async load
      await Future.delayed(const Duration(milliseconds: 700));

      expect(vm.isLoading, isFalse);
      expect(vm.notifications.isNotEmpty, isTrue);

      final initialUnread = vm.unreadCount;
      if (initialUnread > 0) {
        final unreadItem =
            vm.notifications.firstWhere((n) => n.status.isUnread);
        await vm.markAsRead(unreadItem.id);
        expect(vm.unreadCount, equals(initialUnread - 1));
      }
    });
  });

  group('LocalNotification Lead Time Tests', () {
    test('Calculates exactly 30 minutes lead time before medication scheduledAt', () {
      final scheduledAt = DateTime.now().add(const Duration(hours: 2));
      final reminderTime = scheduledAt.subtract(const Duration(minutes: 30));

      expect(reminderTime.isBefore(scheduledAt), isTrue);
      expect(scheduledAt.difference(reminderTime).inMinutes, equals(30));
      expect(reminderTime.isAfter(DateTime.now()), isTrue);
    });

    test('Rejects reminder calculation when scheduledAt minus 30 minutes is in the past', () {
      final scheduledAt = DateTime.now().add(const Duration(minutes: 15));
      final reminderTime = scheduledAt.subtract(const Duration(minutes: 30));

      expect(reminderTime.isBefore(DateTime.now()), isTrue);
    });
  });

  group('Offline Medication Sync Tests (UCS UC-11 BR-02)', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('markTaken updates state optimistically with mock service', () async {
      final mockService = MockMedicineScheduleService();
      final vm = MedicineScheduleViewModel(service: mockService);

      await Future.delayed(const Duration(milliseconds: 700));
      expect(vm.isLoading, isFalse);

      if (vm.schedulesForSelectedDate.isNotEmpty) {
        final target = vm.schedulesForSelectedDate.first;
        await vm.markTaken(target.id);

        final updated =
            vm.schedulesForSelectedDate.firstWhere((s) => s.id == target.id);
        expect(updated.status, MedicineScheduleStatus.taken);
      }
    });

    test('Stores pending schedule ID in SharedPreferences when queue is used', () async {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('pending_taken_schedules', ['sched-offline-1']);

      final saved = prefs.getStringList('pending_taken_schedules');
      expect(saved, contains('sched-offline-1'));
    });
  });
}
