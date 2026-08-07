import 'package:flutter/material.dart';
import '../models/dto/medicine_schedule_response.dart';
import '../services/abstract/medicine_schedule_service_abstract.dart';
import '../services/remote/remote_medicine_schedule_service.dart';

class MedicineScheduleViewModel extends ChangeNotifier {
  // TODO: Inject via get_it or similar in the future.
  final MedicineScheduleServiceAbstract _service = RemoteMedicineScheduleService();

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
    final response = await _service.markTaken(scheduleId);
    if (response.success && response.data != null) {
      final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
      if (idx != -1) {
        _allSchedules[idx] = response.data!;
        notifyListeners();
      }
    } else {
      _errorMessage = response.message;
      notifyListeners();
    }
  }

  Future<String?> updateScheduleTime(String scheduleId, DateTime newTime) async {
    final response = await _service.updateScheduleTime(scheduleId, newTime);
    if (response.success && response.data != null) {
      final idx = _allSchedules.indexWhere((s) => s.id == scheduleId);
      if (idx != -1) {
        _allSchedules[idx] = response.data!;
        _selectedDate = DateTime(newTime.year, newTime.month, newTime.day);
        notifyListeners();
      }
      return null;
    } else {
      return response.message;
    }
  }

  Future<void> refresh() => _load();

  Future<void> _load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _service.getMedicineSchedules();
    if (response.success && response.data != null) {
      _allSchedules = response.data!;
      
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
