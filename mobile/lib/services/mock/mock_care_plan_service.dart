import 'dart:math';

import '../../core/models/api_response.dart';
import '../../models/dto/dish_response.dart';
import '../../models/dto/meal_response.dart';
import '../../models/dto/workout_response.dart';
import '../abstract/care_plan_service_abstract.dart';

/// Chứa dữ liệu mock cho CarePlanService
class MockCarePlanService implements CarePlanServiceAbstract {
  final List<MealResponse> _meals = [];
  final List<WorkoutResponse> _workouts = [];
  final _random = Random();

  MockCarePlanService() {
    // Tự động generate vài dữ liệu mock cho hôm nay và hôm qua
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));

    _meals.add(
      MealResponse(
        id: 'm1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 7, 30),
        status: PlanScheduleStatus.completed,
        totalCalories: 450,
        note: 'Ăn nhẹ',
        dishes: [
          DishResponse(id: 'd1', dishName: 'Phở bò', quantity: 1, unit: 'tô', totalCalories: 450),
        ],
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w1',
        workoutName: 'Chạy bộ',
        scheduledAt: DateTime(today.year, today.month, today.day, 6, 0),
        status: PlanScheduleStatus.notYet,
        content: 'Chạy bộ 5km quanh công viên',
        note: 'Nhớ khởi động kỹ',
      ),
    );
  }

  @override
  Future<ApiResponse<List<MealResponse>>> getMeals() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return ApiResponse.success('Thành công', _meals);
  }

  @override
  Future<ApiResponse<MealResponse>> addMeal({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));

    final newDishes = dishes.map((d) => DishResponse(
      id: 'd_${_random.nextInt(1000)}',
      dishName: d['dishName'] as String,
      quantity: (d['quantity'] as num).toDouble(),
      unit: d['unit'] as String,
      totalCalories: (d['totalCalories'] as num?)?.toDouble() ?? 0,
      totalProtein: (d['totalProtein'] as num?)?.toDouble(),
      totalCarbohydrates: (d['totalCarbohydrates'] as num?)?.toDouble(),
      totalFat: (d['totalFat'] as num?)?.toDouble(),
    )).toList();

    final totalCal = newDishes.fold(0.0, (sum, d) => sum + d.totalCalories);

    final meal = MealResponse(
      id: 'm_${_random.nextInt(1000)}',
      mealName: mealName,
      scheduledAt: scheduledAt,
      status: PlanScheduleStatus.notYet,
      totalCalories: totalCal,
      note: note,
      dishes: newDishes,
    );

    _meals.add(meal);
    return ApiResponse.success('Thành công', meal);
  }

  @override
  Future<ApiResponse<MealResponse>> completeMeal(String mealId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _meals.indexWhere((m) => m.id == mealId);
    if (index != -1) {
      final old = _meals[index];
      _meals[index] = MealResponse(
        id: old.id,
        mealName: old.mealName,
        scheduledAt: old.scheduledAt,
        status: PlanScheduleStatus.completed,
        totalCalories: old.totalCalories,
        note: old.note,
        dishes: old.dishes,
      );
      return ApiResponse.success('Thành công', _meals[index]);
    }
    return ApiResponse.failure('Không tìm thấy bữa ăn');
  }

  @override
  Future<ApiResponse<List<WorkoutResponse>>> getWorkouts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return ApiResponse.success('Thành công', _workouts);
  }

  @override
  Future<ApiResponse<WorkoutResponse>> addWorkout({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final workout = WorkoutResponse(
      id: 'w_${_random.nextInt(1000)}',
      workoutName: workoutName,
      scheduledAt: scheduledAt,
      status: PlanScheduleStatus.notYet,
      content: content,
      note: note,
    );
    _workouts.add(workout);
    return ApiResponse.success('Thành công', workout);
  }

  @override
  Future<ApiResponse<WorkoutResponse>> completeWorkout(String workoutId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _workouts.indexWhere((w) => w.id == workoutId);
    if (index != -1) {
      final old = _workouts[index];
      _workouts[index] = WorkoutResponse(
        id: old.id,
        workoutName: old.workoutName,
        scheduledAt: old.scheduledAt,
        status: PlanScheduleStatus.completed,
        content: old.content,
        note: old.note,
      );
      return ApiResponse.success('Thành công', _workouts[index]);
    }
    return ApiResponse.failure('Không tìm thấy bài tập');
  }
}
