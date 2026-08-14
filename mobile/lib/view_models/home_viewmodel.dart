import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/appointment_models.dart';
import '../models/health_news_model.dart';
import '../models/vital_chart_model.dart';
import '../services/mock/mock_health_news_service.dart';
import '../services/mock/mock_medical_record_service.dart';
import '../services/abstract/auth_service_abstract.dart';
import '../services/mock/mock_auth_service.dart';
import '../services/remote/auth_service.dart';
import '../core/config/environment_config.dart';

class HomeViewModel extends ChangeNotifier {
  final MockMedicalRecordService _medService = MockMedicalRecordService();
  final MockHealthNewsService _newsService = MockHealthNewsService();
  final AuthServiceAbstract _authService = EnvironmentConfig.isMock
      ? MockAuthService()
      : RemoteAuthService();

  // ── State ──────────────────────────────────────────────────────────────────
  bool _isLoading = true;
  String _userName = 'Nguyễn Văn A';
  List<VitalChartPoint> _vitalHistory = [];
  List<HealthNewsArticle> _news = [];

  // ── Getters ────────────────────────────────────────────────────────────────
  bool get isLoading => _isLoading;
  String get userName => _userName;
  List<VitalChartPoint> get vitalHistory => _vitalHistory;
  List<HealthNewsArticle> get news => _news;

  /// Greeting string based on current hour.
  String get greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  }

  // ── Mock next appointment ─────────────────────────────────────────────────
  // Hardcoded from mock data matching rec-001 (BS. Nguyễn Thị Lan).
  // Replace with a proper API call when the appointment endpoint is stable.
  static final NextAppointmentInfo _mockNextAppt = NextAppointmentInfo(
    doctorName: 'BS. Nguyễn Thị Lan',
    specialty: 'Tim mạch',
    location: 'A101 — Phòng A',
    dateTime: DateTime.now().add(const Duration(days: 3, hours: 2)),
    status: 'Đã xác nhận',
  );

  /// Returns the next upcoming appointment, or null if none.
  NextAppointmentInfo? get nextAppointment =>
      _mockNextAppt.dateTime.isAfter(DateTime.now()) ? _mockNextAppt : null;

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

    _vitalHistory = await _buildVitalHistory();
    _news = await _newsService.getArticles();

    _isLoading = false;
    notifyListeners();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  Future<List<VitalChartPoint>> _buildVitalHistory() async {
    final records = await _medService.getRecords();
    final points = <VitalChartPoint>[];

    for (final rec in records) {
      final detail = await _medService.getRecordDetail(rec.id);
      final v = detail?.vitalSigns;
      if (v == null) continue;

      final systolic =
          double.tryParse(v.bloodPressure.split('/').first) ?? 120;

      points.add(VitalChartPoint(
        date: rec.dateTime,
        heartRate: v.heartRate.toDouble(),
        systolic: systolic,
        respRate: v.respiratoryRate.toDouble(),
        temperature: v.bodyTemperature,
      ));
    }

    points.sort((a, b) => a.date.compareTo(b.date));
    return points;
  }
}
