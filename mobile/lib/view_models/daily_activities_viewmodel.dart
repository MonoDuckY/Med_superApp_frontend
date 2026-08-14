import 'package:flutter/material.dart';
import '../models/dto/meal_response.dart';
import '../models/dto/workout_response.dart';
import '../services/abstract/care_plan_service_abstract.dart';
import '../services/mock/mock_care_plan_service.dart';
import '../services/remote/remote_care_plan_service.dart';
import '../core/config/environment_config.dart';

/// UC-08 — ViewModel quản lý dữ liệu hoạt động sức khỏe hàng ngày.
///
/// Business Rule BR-02: Chỉ cho phép chọn hôm nay và 2 ngày trước.
class DailyActivitiesViewModel extends ChangeNotifier {
  final CarePlanServiceAbstract _service = EnvironmentConfig.isMock 
      ? MockCarePlanService() 
      : RemoteCarePlanService();

  DailyActivitiesViewModel() {
    _load();
  }


  // ── State ─────────────────────────────────────────────────────────────────

  List<MealResponse> _allMeals = [];
  List<WorkoutResponse> _allWorkouts = [];

  bool _isLoading = false;
  String? _errorMessage;

  /// Ngày hiện tại được chọn (chỉ date part, không có time).
  DateTime _selectedDate = _dateOnly(DateTime.now());

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  DateTime get selectedDate => _selectedDate;

  // ── Selectable dates (BR-02: hôm nay + 2 ngày trước) ─────────────────────

  /// Danh sách 3 ngày được phép chọn: hôm nay và 2 ngày trước theo BR-02.
  List<DateTime> get allowedDates {
    final today = _dateOnly(DateTime.now());
    final dates = List.generate(3, (index) => today.subtract(Duration(days: index)));
    if (!dates.any((d) => _isSameDay(d, _selectedDate))) {
      dates.add(_selectedDate);
      dates.sort((a, b) => b.compareTo(a));
    }
    return dates;
  }

  /// Kiểm tra ngày được chọn có nằm trong phạm vi cho phép ghi nhật ký (hôm nay và 2 ngày trước).
  bool get isSelectedDateAllowed {
    final today = _dateOnly(DateTime.now());
    final minDate = today.subtract(const Duration(days: 2));
    return !_selectedDate.isAfter(today) && !_selectedDate.isBefore(minDate);
  }

  void selectDate(DateTime date) {
    _selectedDate = _dateOnly(date);
    notifyListeners();
  }

  // ── Filtered by selected date ─────────────────────────────────────────────

  List<MealResponse> get mealsForSelectedDate {
    return _allMeals
        .where((m) => _isSameDay(m.scheduledAt, _selectedDate))
        .toList()
      ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
  }

  List<WorkoutResponse> get workoutsForSelectedDate {
    return _allWorkouts
        .where((w) => _isSameDay(w.scheduledAt, _selectedDate))
        .toList()
      ..sort((a, b) => a.scheduledAt.compareTo(b.scheduledAt));
  }

  /// Tổng calo bữa ăn trong ngày được chọn.
  double get totalCaloriesForSelectedDate =>
      mealsForSelectedDate.fold(0.0, (sum, m) => sum + m.totalCalories);

  /// Số bài tập đã hoàn thành trong ngày.
  int get completedWorkoutsForSelectedDate =>
      workoutsForSelectedDate.where((w) => w.status.isDone).length;

  // ── Actions ───────────────────────────────────────────────────────────────

  Future<String?> addMeal({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  }) async {
    final response = await _service.addMeal(
      mealName: mealName,
      scheduledAt: scheduledAt,
      dishes: dishes,
      note: note,
    );

    if (response.success && response.data != null) {
      _allMeals.add(response.data!);
      notifyListeners();
      return null;
    }
    return response.message;
  }

  Future<String?> completeMeal(String mealId) async {
    final response = await _service.completeMeal(mealId);
    if (response.success && response.data != null) {
      final idx = _allMeals.indexWhere((m) => m.id == mealId);
      if (idx != -1) {
        _allMeals[idx] = response.data!;
        notifyListeners();
      }
      return null;
    }
    return response.message;
  }

  Future<String?> addWorkout({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) async {
    final response = await _service.addWorkout(
      workoutName: workoutName,
      scheduledAt: scheduledAt,
      content: content,
      note: note,
    );

    if (response.success && response.data != null) {
      _allWorkouts.add(response.data!);
      notifyListeners();
      return null;
    }
    return response.message;
  }

  Future<String?> completeWorkout(String workoutId) async {
    final response = await _service.completeWorkout(workoutId);
    if (response.success && response.data != null) {
      final idx = _allWorkouts.indexWhere((w) => w.id == workoutId);
      if (idx != -1) {
        _allWorkouts[idx] = response.data!;
        notifyListeners();
      }
      return null;
    }
    return response.message;
  }

  Future<void> refresh() => _load();

  // ── Private helpers ───────────────────────────────────────────────────────

  Future<void> _load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final mealsResult = await _service.getMeals();
    final workoutsResult = await _service.getWorkouts();

    if (mealsResult.success) {
      _allMeals = mealsResult.data ?? [];
    } else {
      _errorMessage = mealsResult.message;
    }

    if (workoutsResult.success) {
      _allWorkouts = workoutsResult.data ?? [];
    } else {
      _errorMessage ??= workoutsResult.message;
    }

    _isLoading = false;
    notifyListeners();
  }

  static DateTime _dateOnly(DateTime dt) =>
      DateTime(dt.year, dt.month, dt.day);

  static bool _isSameDay(DateTime a, DateTime b) =>
      a.year == b.year && a.month == b.month && a.day == b.day;
}
