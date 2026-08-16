import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/dto/medicine_schedule_response.dart';
import '../services/abstract/medicine_schedule_service_abstract.dart';
import '../services/remote/remote_medicine_schedule_service.dart';
import '../services/mock/mock_medicine_schedule_service.dart';
import '../services/local/local_notification_service.dart';
import '../core/config/environment_config.dart';

class MedicineScheduleViewModel extends ChangeNotifier {
  static const String _keyPendingTakenSchedules = 'pending_taken_schedules';

  final MedicineScheduleServiceAbstract _service;

  MedicineScheduleViewModel({MedicineScheduleServiceAbstract? service})
      : _service = service ??
            (EnvironmentConfig.isMock
                ? MockMedicineScheduleService()
                : RemoteMedicineScheduleService()) {
    _load();
  }

  List<MedicineScheduleResponse> _allSchedules = [];
  bool _isLoading = false;
  String? _errorMessage;
  DateTime _selectedDate = DateTime.now();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DateTime get selectedDate => _selectedDate;

  List<DateTime> get availableDates {
    final set = <String>{};
    final dates = <DateTime>[];
    for (final s in _allSchedules) {
      final d = DateTime(s.scheduledAt.year, s.scheduledAt.month, s.scheduledAt.day);
      final key = '${d.year}-${d.month}-${d.day}';
      if (set.add(key)) dates.add(d);
    }
    dates.sort();
    return dates;
  }

  List<MedicineScheduleResponse> get schedulesForSelectedDate {
    return _allSchedules
        .where((s) =>
            s.scheduledAt.year == _selectedDate.year &&
            s.scheduledAt.month == _selectedDate.month &&
            s.scheduledAt.day == _selectedDate.day)
        .toList()
      ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
  }

  List<MedicineScheduleResponse> get _todaySchedules {
    final now = DateTime.now();
    return _allSchedules
        .where((s) =>
            s.scheduledAt.year == now.year &&
            s.scheduledAt.month == now.month &&
            s.scheduledAt.day == now.day)
        .toList();
  }

  int get todayTotal => _todaySchedules.length;
  int get todayTaken =>
      _todaySchedules.where((s) => s.status == MedicineScheduleStatus.taken).length;
  int get todayRemaining =>
      _todaySchedules.where((s) => s.status == MedicineScheduleStatus.notYet && !s.isOverdue).length;
  int get todayOverdue =>
      _todaySchedules.where((s) => s.isOverdue).length;

  void selectDate(DateTime date) {
    _selectedDate = DateTime(date.year, date.month, date.day);
    notifyListeners();
  }

  /// Đánh dấu đã uống thuốc (Hỗ trợ Offline Queue theo UCS UC-11 BR-02)
  Future<void> markTaken(String scheduleId) async {
    final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
    if (idx == -1) return;

    final original = _allSchedules[idx];
    if (original.status == MedicineScheduleStatus.taken) return;

    // 1. Cập nhật giao diện tức thì (Optimistic UI)
    _allSchedules[idx] = original.copyWith(status: MedicineScheduleStatus.taken);
    notifyListeners();

    // 2. Hủy chuông báo cục bộ của cữ thuốc này
    await LocalNotificationService.instance.cancelMedicineReminder(scheduleId);

    // 3. Gửi lên máy chủ
    final response = await _service.markTaken(scheduleId);
    if (response.success && response.data != null) {
      _allSchedules[idx] = response.data!;
      notifyListeners();
    } else {
      // 4. Nếu mất mạng hoặc lỗi kết nối, lưu vào hàng đợi offline
      try {
        final prefs = await SharedPreferences.getInstance();
        final pendingIds = prefs.getStringList(_keyPendingTakenSchedules) ?? [];
        if (!pendingIds.contains(scheduleId)) {
          pendingIds.add(scheduleId);
          await prefs.setStringList(_keyPendingTakenSchedules, pendingIds);
        }
      } catch (_) {}
      // Giữ nguyên trạng thái đã uống trên màn hình mà không báo lỗi cản trở người dùng
    }
  }

  Future<String?> updateScheduleTime(String scheduleId, DateTime newTime) async {
    final response = await _service.updateScheduleTime(scheduleId, newTime);
    if (response.success && response.data != null) {
      final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
      if (idx != -1) {
        _allSchedules[idx] = response.data!;
        _selectedDate = DateTime(newTime.year, newTime.month, newTime.day);
        await LocalNotificationService.instance.syncAllMedicineReminders(_allSchedules);
        notifyListeners();
      }
      return null;
    } else {
      return response.message;
    }
  }

  Future<void> refresh() => _load();

  /// Tự động đồng bộ các hành động uống thuốc offline lên máy chủ khi có mạng lại
  Future<void> _syncPendingTakenActions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final pendingIds = prefs.getStringList(_keyPendingTakenSchedules) ?? [];
      if (pendingIds.isEmpty) return;

      final remainingIds = <String>[];
      for (final id in pendingIds) {
        final res = await _service.markTaken(id);
        if (!res.success && res.errorCode != 'CONFLICT') {
          remainingIds.add(id);
        }
      }
      await prefs.setStringList(_keyPendingTakenSchedules, remainingIds);
    } catch (_) {}
  }

  Future<void> _load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    // 1. Đồng bộ các hành động offline còn tồn đọng nếu có
    await _syncPendingTakenActions();

    // 2. Lấy dữ liệu mới nhất từ máy chủ
    final response = await _service.getMedicineSchedules();
    if (response.success && response.data != null) {
      _allSchedules = response.data!;

      // 3. Áp dụng lại các trạng thái offline pending nếu máy chủ chưa cập nhật
      try {
        final prefs = await SharedPreferences.getInstance();
        final pendingIds = prefs.getStringList(_keyPendingTakenSchedules) ?? [];
        if (pendingIds.isNotEmpty) {
          _allSchedules = _allSchedules.map((s) {
            if (pendingIds.contains(s.id)) {
              return s.copyWith(status: MedicineScheduleStatus.taken);
            }
            return s;
          }).toList();
        }
      } catch (_) {}

      // 4. Đồng bộ lập lịch chuông báo cục bộ trên thiết bị trước 30 phút
      await LocalNotificationService.instance.syncAllMedicineReminders(_allSchedules);

      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final hasTodaySchedule = _allSchedules.any((s) =>
          s.scheduledAt.year == today.year &&
          s.scheduledAt.month == today.month &&
          s.scheduledAt.day == today.day);

      if (!hasTodaySchedule && availableDates.isNotEmpty) {
        _selectedDate = availableDates.first;
      } else {
        _selectedDate = today;
      }
    } else {
      _errorMessage = response.message;
      _allSchedules = [];
    }

    _isLoading = false;
    notifyListeners();
  }
}
