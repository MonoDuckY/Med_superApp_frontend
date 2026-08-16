import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/appointment_models.dart';
import '../models/health_news_model.dart';
import '../models/vital_chart_model.dart';
import '../services/abstract/medical_record_service_abstract.dart';
import '../services/mock/mock_health_news_service.dart';
import '../services/mock/mock_medical_record_service.dart';
import '../services/remote/remote_medical_record_service.dart';
import '../services/abstract/appointment_service_abstract.dart';
import '../services/mock/mock_appointment_service.dart';
import '../services/remote/remote_appointment_service.dart';
import '../core/config/environment_config.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../services/abstract/notification_service_abstract.dart';
import '../services/mock/mock_notification_service.dart';
import '../services/remote/remote_notification_service.dart';

class HomeViewModel extends ChangeNotifier {
  final IMedicalRecordService _medService = EnvironmentConfig.isMock
      ? MockMedicalRecordService()
      : RemoteMedicalRecordService();
  final IAppointmentService _appointmentService = EnvironmentConfig.isMock
      ? MockAppointmentService()
      : RemoteAppointmentService();
  final MockHealthNewsService _newsService = MockHealthNewsService();
  final AuthServiceAbstract _authService = EnvironmentConfig.isMock
      ? MockAuthService()
      : RemoteAuthService();
  final NotificationServiceAbstract _notificationService = EnvironmentConfig.isMock
      ? MockNotificationService()
      : RemoteNotificationService();

  // ── State ──────────────────────────────────────────────────────────────────
  bool _isLoading = true;
  String _userName = 'Nguyễn Văn A';
  List<VitalChartPoint> _vitalHistory = [];
  List<HealthNewsArticle> _news = [];
  int _unreadNotificationCount = 0;
  NextAppointmentInfo? _nextAppointment;

  // ── Getters ────────────────────────────────────────────────────────────────
  bool get isLoading => _isLoading;
  String get userName => _userName;
  List<VitalChartPoint> get vitalHistory => _vitalHistory;
  List<HealthNewsArticle> get news => _news;
  int get unreadNotificationCount => _unreadNotificationCount;
  NextAppointmentInfo? get nextAppointment => _nextAppointment;

  /// Greeting string based on current hour.
  String get greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  Future<void> load() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      var name = prefs.getString(AppConstants.keyUserName) ??
          prefs.getString(AppConstants.keyUserData) ??
          'Nguyễn Văn A';
      if (RegExp(r'^\d+$').hasMatch(name.trim())) {
        name = 'Nguyễn Văn A';
      }
      _userName = name;
    } catch (_) {}

    try {
      final res = await _authService.getProfile();
      if (res.success && res.data?.fullName != null && res.data!.fullName!.isNotEmpty) {
        _userName = res.data!.fullName!;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.keyUserName, _userName);
      }
    } catch (_) {}

    try {
      final notifRes = await _notificationService.getUnreadCount();
      if (notifRes.success && notifRes.data != null) {
        _unreadNotificationCount = notifRes.data!;
      }
    } catch (_) {}

    try {
      final appts = await _appointmentService.getPatientAppointments();
      final now = DateTime.now();
      NextAppointmentInfo? earliest;
      for (final a in appts) {
        if (a.status.toUpperCase() == 'CANCELLED' || a.status.toUpperCase() == 'REJECTED') {
          continue;
        }
        DateTime dt = DateTime.now();
        if (a.doctorWorkSlot != null && a.slot != null) {
          final dateStr = a.doctorWorkSlot!.workDate;
          String timeStr = a.slot!.startTime;
          if (timeStr.length == 5) timeStr = '$timeStr:00';
          dt = DateTime.tryParse('${dateStr}T$timeStr') ?? dt;
        } else if (a.requestedAt != null) {
          dt = DateTime.tryParse(a.requestedAt!)?.toLocal() ?? dt;
        }

        if (dt.isAfter(now)) {
          if (earliest == null || dt.isBefore(earliest.dateTime)) {
            final docName = a.doctor?.fullName ?? 'Bác sĩ chuyên khoa';
            final roomName = a.room?.roomName ?? 'Phòng khám';
            final loc = a.room != null ? '${a.room!.id} - ${a.room!.roomName}' : 'Bệnh viện';
            final statusStr = a.status.toUpperCase() == 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt';
            earliest = NextAppointmentInfo(
              doctorName: docName,
              specialty: roomName,
              location: loc,
              dateTime: dt,
              status: statusStr,
            );
          }
        }
      }
      _nextAppointment = earliest;
    } catch (_) {}

    _vitalHistory = await _buildVitalHistory();
    _news = await _newsService.getArticles();

    _isLoading = false;
    notifyListeners();
  }

  /// Làm mới số lượng thông báo chưa đọc khi quay lại màn hình Home
  Future<void> refreshUnreadCount() async {
    try {
      final notifRes = await _notificationService.getUnreadCount();
      if (notifRes.success && notifRes.data != null) {
        _unreadNotificationCount = notifRes.data!;
        notifyListeners();
      }
    } catch (_) {}
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  Future<List<VitalChartPoint>> _buildVitalHistory() async {
    final records = await _medService.getRecords();
    final points = <VitalChartPoint>[];

    for (final rec in records) {
      final detail = await _medService.getRecordDetail(rec.id);
      final v = detail?.vitalSigns;
      if (v == null) continue;

      double systolic = 120.0;
      double diastolic = 80.0;

      final bpStr = v.bloodPressure.trim();
      if (bpStr.contains('/')) {
        final parts = bpStr.split('/');
        systolic = double.tryParse(parts[0].trim()) ?? 120.0;
        if (parts.length > 1) {
          diastolic = double.tryParse(parts[1].trim()) ?? 80.0;
        }
      } else if (bpStr.contains('-')) {
        final parts = bpStr.split('-');
        systolic = double.tryParse(parts[0].trim()) ?? 120.0;
        if (parts.length > 1) {
          diastolic = double.tryParse(parts[1].trim()) ?? 80.0;
        }
      } else {
        final raw = double.tryParse(bpStr) ?? 120.0;
        if (raw >= 1000 && raw <= 2500) {
          final s = raw.toInt().toString();
          if (s.length == 4) {
            systolic = double.tryParse(s.substring(0, 2)) ?? 120.0;
            diastolic = double.tryParse(s.substring(2)) ?? 80.0;
            if (systolic < 60) {
              systolic = double.tryParse(s.substring(0, 3)) ?? 120.0;
              diastolic = double.tryParse(s.substring(3)) ?? 80.0;
            }
          } else if (s.length == 5) {
            systolic = double.tryParse(s.substring(0, 3)) ?? 120.0;
            diastolic = double.tryParse(s.substring(3)) ?? 80.0;
          }
        } else if (raw >= 50 && raw <= 260) {
          systolic = raw;
          diastolic = 80.0;
        }
      }

      // Clamp reasonable clinical bounds
      if (systolic > 260) systolic = 140;
      if (systolic < 50) systolic = 90;
      if (diastolic > 160) diastolic = 90;
      if (diastolic < 30) diastolic = 60;

      points.add(VitalChartPoint(
        date: rec.dateTime,
        heartRate: v.heartRate.toDouble(),
        systolic: systolic,
        diastolic: diastolic,
        respRate: v.respiratoryRate.toDouble(),
        temperature: v.bodyTemperature,
      ));
    }

    points.sort((a, b) => a.date.compareTo(b.date));
    return points;
  }
}
