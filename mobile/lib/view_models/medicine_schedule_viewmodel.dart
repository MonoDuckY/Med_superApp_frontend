import 'package:flutter/material.dart';
import '../models/dto/medicine_schedule_response.dart';
import '../models/dto/medicine_schedule_mock_data.dart';

class MedicineScheduleViewModel extends ChangeNotifier {
  MedicineScheduleViewModel() {
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

  Future<void> markTaken(String scheduleId) async {
    final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
    if (idx == -1) return;
    final schedule = _allSchedules[idx];
    if (schedule.status != MedicineScheduleStatus.notYet) return;
    _allSchedules[idx] = schedule.copyWith(status: MedicineScheduleStatus.taken);
    notifyListeners();
  }

  Future<String?> updateScheduleTime(String scheduleId, DateTime newTime) async {
    if (!newTime.isAfter(DateTime.now())) {
      return 'Giờ uống mới phải trong tương lai.';
    }
    final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
    if (idx == -1) return 'Không tìm thấy lịch.';
    final schedule = _allSchedules[idx];
    if (schedule.status != MedicineScheduleStatus.notYet) {
      return 'Chỉ lịch chưa uống mới có thể đổi giờ.';
    }
    final duplicate = _allSchedules.any((s) =>
        s.id != scheduleId &&
        s.prescriptionId == schedule.prescriptionId &&
        s.medicineName == schedule.medicineName &&
        s.dosage == schedule.dosage &&
        s.scheduledAt.isAtSameMomentAs(newTime));
    if (duplicate) return 'Đã có lịch uống cùng thuốc vào giờ này.';

    _allSchedules[idx] = schedule.copyWith(scheduledAt: newTime);
    _selectedDate = DateTime(newTime.year, newTime.month, newTime.day);
    notifyListeners();
    return null;
  }

  Future<void> refresh() => _load();

  Future<void> _load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 600));
    _allSchedules = MedicineScheduleMockData.generate();

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

    _isLoading = false;
    notifyListeners();
  }
}
