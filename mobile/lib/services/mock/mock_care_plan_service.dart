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
    final threeDaysAgo = today.subtract(const Duration(days: 3));
    final fiveDaysAgo = today.subtract(const Duration(days: 5));

    // Bữa ăn 5 ngày trước
    _meals.add(
      MealResponse(
        id: 'm_past_1',
        userId: 'u1',
        mealName: 'Bữa trưa',
        scheduledAt: DateTime(fiveDaysAgo.year, fiveDaysAgo.month, fiveDaysAgo.day, 12, 30),
        status: PlanScheduleStatus.completed,
        note: 'Ăn trễ',
        dishes: [
          DishResponse(id: 'd_p1', dishName: 'Bún chả', quantity: 1, unit: 'tô', totalCalories: 600),
        ],
      ),
    );

    // Bữa ăn 3 ngày trước
    _meals.add(
      MealResponse(
        id: 'm_past_2',
        userId: 'u1',
        mealName: 'Bữa tối',
        scheduledAt: DateTime(threeDaysAgo.year, threeDaysAgo.month, threeDaysAgo.day, 19, 00),
        status: PlanScheduleStatus.completed,
        note: 'Ăn cùng gia đình',
        dishes: [
          DishResponse(id: 'd_p2', dishName: 'Cơm trắng', quantity: 2, unit: 'chén', totalCalories: 400),
          DishResponse(id: 'd_p3', dishName: 'Canh chua', quantity: 1, unit: 'tô', totalCalories: 150),
        ],
      ),
    );

    // Bữa ăn hôm qua
    _meals.add(
      MealResponse(
        id: 'm1',
        userId: 'u1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 7, 30),
        status: PlanScheduleStatus.completed,
        note: 'Ăn nhẹ',
        dishes: [
          DishResponse(id: 'd1', dishName: 'Phở bò', quantity: 1, unit: 'tô', totalCalories: 450),
        ],
      ),
    );

    // Bữa ăn hôm nay
    _meals.add(
      MealResponse(
        id: 'm2',
        userId: 'u1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(today.year, today.month, today.day, 7, 0),
        status: PlanScheduleStatus.completed,
        note: 'Ăn tại nhà',
        dishes: [
          DishResponse(id: 'd2', dishName: 'Bánh mì ốp la', quantity: 1, unit: 'ổ', totalCalories: 350),
          DishResponse(id: 'd3', dishName: 'Sữa tươi', quantity: 1, unit: 'ly', totalCalories: 150),
        ],
      ),
    );

    _meals.add(
      MealResponse(
        id: 'm3',
        userId: 'u1',
        mealName: 'Bữa trưa',
        scheduledAt: DateTime(today.year, today.month, today.day, 12, 0),
        status: PlanScheduleStatus.notYet,
        note: 'Ăn trưa công ty',
        dishes: [
          DishResponse(id: 'd4', dishName: 'Cơm tấm sườn', quantity: 1, unit: 'dĩa', totalCalories: 700),
          DishResponse(id: 'd5', dishName: 'Trà đá', quantity: 1, unit: 'ly', totalCalories: 0),
        ],
      ),
    );

    _meals.add(
      MealResponse(
        id: 'm4',
        userId: 'u1',
        mealName: 'Bữa tối',
        scheduledAt: DateTime(today.year, today.month, today.day, 19, 0),
        status: PlanScheduleStatus.notYet,
        note: 'Ăn nhẹ nhàng',
        dishes: [
          DishResponse(id: 'd6', dishName: 'Salad cá hồi', quantity: 1, unit: 'phần', totalCalories: 300),
          DishResponse(id: 'd7', dishName: 'Nước cam', quantity: 1, unit: 'ly', totalCalories: 120),
        ],
      ),
    );

    // Workouts
    _workouts.add(
      WorkoutResponse(
        id: 'w_past_1',
        userId: 'u1',
        workoutName: 'Bơi lội',
        scheduledAt: DateTime(threeDaysAgo.year, threeDaysAgo.month, threeDaysAgo.day, 16, 0),
        status: PlanScheduleStatus.completed,
        content: 'Bơi 20 vòng',
        note: 'Hồ bơi công cộng',
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w1',
        userId: 'u1',
        workoutName: 'Chạy bộ',
        scheduledAt: DateTime(today.year, today.month, today.day, 6, 0),
        status: PlanScheduleStatus.completed,
        content: 'Chạy bộ 5km quanh công viên',
        note: 'Nhớ khởi động kỹ',
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w2',
        userId: 'u1',
        workoutName: 'Tập Gym',
        scheduledAt: DateTime(today.year, today.month, today.day, 17, 30),
        status: PlanScheduleStatus.notYet,
        content: 'Tập ngực và tay sau',
        note: 'Uống đủ nước',
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w3',
        userId: 'u1',
        workoutName: 'Yoga',
        scheduledAt: DateTime(today.year, today.month, today.day, 21, 0),
        status: PlanScheduleStatus.notYet,
        content: 'Yoga giãn cơ nhẹ nhàng trước khi ngủ',
        note: 'Thảm Yoga',
      ),
    );
  }

  @override
  Future<ApiResponse<List<MealResponse>>> getMeals() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return ApiResponse.success(List.from(_meals), message: 'Thành công');
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

    final meal = MealResponse(
      id: 'm_${_random.nextInt(1000)}',
      userId: 'u1',
      mealName: mealName,
      scheduledAt: scheduledAt,
      status: PlanScheduleStatus.notYet,
      note: note,
      dishes: newDishes,
    );

    _meals.add(meal);
    return ApiResponse.success(meal, message: 'Thành công');
  }

  @override
  Future<ApiResponse<MealResponse>> completeMeal(String mealId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _meals.indexWhere((m) => m.id == mealId);
    if (index != -1) {
      _meals[index] = _meals[index].copyWith(status: PlanScheduleStatus.completed);
      return ApiResponse.success(_meals[index], message: 'Thành công');
    }
    return ApiResponse.failure('Không tìm thấy bữa ăn');
  }

  @override
  Future<ApiResponse<List<WorkoutResponse>>> getWorkouts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return ApiResponse.success(List.from(_workouts), message: 'Thành công');
  }

  @override
  Future<ApiResponse<WorkoutResponse>> addWorkout({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));

    final newWorkout = WorkoutResponse(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      userId: 'mock_user_1',
      workoutName: workoutName,
      content: content,
      scheduledAt: scheduledAt,
      status: PlanScheduleStatus.notYet,
      note: note,
    );
    _workouts.add(newWorkout);
    return ApiResponse.success(newWorkout, message: 'Thành công');
  }

  @override
  Future<ApiResponse<WorkoutResponse>> completeWorkout(String workoutId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _workouts.indexWhere((w) => w.id == workoutId);
    if (index != -1) {
      _workouts[index] = _workouts[index].copyWith(status: PlanScheduleStatus.completed);
      return ApiResponse.success(_workouts[index], message: 'Thành công');
    }
    return ApiResponse.failure('Không tìm thấy bài tập');
  }
}
