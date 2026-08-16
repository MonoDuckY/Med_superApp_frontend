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
    // Tự động generate dữ liệu mock cho 3 ngày: Hôm nay, Hôm qua và 2 ngày trước theo BR-02
    final today = DateTime.now();
    final yesterday = today.subtract(const Duration(days: 1));
    final twoDaysAgo = today.subtract(const Duration(days: 2));

    // ── 2 ngày trước ────────────────────────────────────────────────────────
    _meals.add(
      MealResponse(
        id: 'm_past_2',
        userId: 'u1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(twoDaysAgo.year, twoDaysAgo.month, twoDaysAgo.day, 7, 15),
        status: PlanScheduleStatus.completed,
        note: 'Ăn tại nhà',
        dishes: [
          DishResponse(id: 'd_p1', dishName: 'Hủ tiếu Nam Vang', quantity: 1, unit: 'tô', totalCalories: 480, totalProtein: 22, totalCarbohydrates: 65, totalFat: 12),
        ],
      ),
    );
    _meals.add(
      MealResponse(
        id: 'm_past_3',
        userId: 'u1',
        mealName: 'Bữa trưa',
        scheduledAt: DateTime(twoDaysAgo.year, twoDaysAgo.month, twoDaysAgo.day, 12, 15),
        status: PlanScheduleStatus.completed,
        note: 'Cơm trưa văn phòng',
        dishes: [
          DishResponse(id: 'd_p2', dishName: 'Cơm cá hồi sốt teriyaki', quantity: 1, unit: 'phần', totalCalories: 550, totalProtein: 30, totalCarbohydrates: 70, totalFat: 14),
          DishResponse(id: 'd_p3', dishName: 'Canh rong biển', quantity: 1, unit: 'chén', totalCalories: 80, totalProtein: 4, totalCarbohydrates: 10, totalFat: 2),
        ],
      ),
    );
    _meals.add(
      MealResponse(
        id: 'm_past_4',
        userId: 'u1',
        mealName: 'Bữa tối',
        scheduledAt: DateTime(twoDaysAgo.year, twoDaysAgo.month, twoDaysAgo.day, 19, 0),
        status: PlanScheduleStatus.completed,
        note: 'Ăn nhẹ nhàng',
        dishes: [
          DishResponse(id: 'd_p4', dishName: 'Cháo yến mạch thịt bằm', quantity: 1, unit: 'tô', totalCalories: 320, totalProtein: 18, totalCarbohydrates: 45, totalFat: 6),
        ],
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w_past_1',
        userId: 'u1',
        workoutName: 'Bơi lội',
        scheduledAt: DateTime(twoDaysAgo.year, twoDaysAgo.month, twoDaysAgo.day, 16, 30),
        status: PlanScheduleStatus.completed,
        content: 'Bơi tự do 30 phút, nhịp tim đều',
        note: 'Cảm thấy rất thoải mái',
      ),
    );

    // ── Hôm qua ─────────────────────────────────────────────────────────────
    _meals.add(
      MealResponse(
        id: 'm1',
        userId: 'u1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 7, 30),
        status: PlanScheduleStatus.completed,
        note: 'Ăn nhẹ trước khi đi làm',
        dishes: [
          DishResponse(id: 'd1', dishName: 'Phở bò tái', quantity: 1, unit: 'tô', totalCalories: 450, totalProtein: 25, totalCarbohydrates: 60, totalFat: 10),
          DishResponse(id: 'd1_2', dishName: 'Trà nóng', quantity: 1, unit: 'ly', totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0),
        ],
      ),
    );
    _meals.add(
      MealResponse(
        id: 'm1_lunch',
        userId: 'u1',
        mealName: 'Bữa trưa',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 12, 0),
        status: PlanScheduleStatus.completed,
        note: 'Ăn cùng đồng nghiệp',
        dishes: [
          DishResponse(id: 'd1_3', dishName: 'Cơm gà luộc', quantity: 1, unit: 'dĩa', totalCalories: 580, totalProtein: 35, totalCarbohydrates: 75, totalFat: 12),
          DishResponse(id: 'd1_4', dishName: 'Canh cải xanh', quantity: 1, unit: 'chén', totalCalories: 50, totalProtein: 2, totalCarbohydrates: 6, totalFat: 1),
        ],
      ),
    );
    _meals.add(
      MealResponse(
        id: 'm1_dinner',
        userId: 'u1',
        mealName: 'Bữa tối',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 18, 30),
        status: PlanScheduleStatus.completed,
        note: 'Salad dinh dưỡng',
        dishes: [
          DishResponse(id: 'd1_5', dishName: 'Salad ức gà sốt mè', quantity: 1, unit: 'phần', totalCalories: 350, totalProtein: 28, totalCarbohydrates: 20, totalFat: 8),
          DishResponse(id: 'd1_6', dishName: 'Nước ép táo', quantity: 1, unit: 'ly', totalCalories: 110, totalProtein: 1, totalCarbohydrates: 25, totalFat: 0),
        ],
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w1_yesterday',
        userId: 'u1',
        workoutName: 'Chạy bộ',
        scheduledAt: DateTime(yesterday.year, yesterday.month, yesterday.day, 17, 30),
        status: PlanScheduleStatus.completed,
        content: 'Chạy bộ 4.5km xung quanh khu dân cư',
        note: 'Khởi động 10 phút trước khi chạy',
      ),
    );

    // ── Hôm nay ─────────────────────────────────────────────────────────────
    _meals.add(
      MealResponse(
        id: 'm2',
        userId: 'u1',
        mealName: 'Bữa sáng',
        scheduledAt: DateTime(today.year, today.month, today.day, 7, 0),
        status: PlanScheduleStatus.completed,
        note: 'Ăn tại nhà',
        dishes: [
          DishResponse(id: 'd2', dishName: 'Bánh mì ốp la 2 trứng', quantity: 1, unit: 'ổ', totalCalories: 380, totalProtein: 16, totalCarbohydrates: 45, totalFat: 14),
          DishResponse(id: 'd3', dishName: 'Sữa tươi không đường', quantity: 1, unit: 'ly', totalCalories: 120, totalProtein: 8, totalCarbohydrates: 12, totalFat: 4),
        ],
      ),
    );

    _meals.add(
      MealResponse(
        id: 'm3',
        userId: 'u1',
        mealName: 'Bữa trưa',
        scheduledAt: DateTime(today.year, today.month, today.day, 11, 45),
        status: PlanScheduleStatus.completed,
        note: 'Ăn trưa',
        dishes: [
          DishResponse(id: 'd4', dishName: 'Cơm tấm sườn bì chả', quantity: 1, unit: 'dĩa', totalCalories: 680, totalProtein: 32, totalCarbohydrates: 80, totalFat: 20),
          DishResponse(id: 'd5', dishName: 'Trà đá', quantity: 1, unit: 'ly', totalCalories: 0, totalProtein: 0, totalCarbohydrates: 0, totalFat: 0),
        ],
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w1',
        userId: 'u1',
        workoutName: 'Đi bộ',
        scheduledAt: DateTime(today.year, today.month, today.day, 6, 15),
        status: PlanScheduleStatus.completed,
        content: 'Đi bộ thể dục buổi sáng 30 phút',
        note: 'Không khí trong lành',
      ),
    );

    _workouts.add(
      WorkoutResponse(
        id: 'w2',
        userId: 'u1',
        workoutName: 'Yoga',
        scheduledAt: DateTime(today.year, today.month, today.day, 12, 30),
        status: PlanScheduleStatus.completed,
        content: 'Giãn cơ nhẹ nhàng sau giờ làm việc',
        note: 'Thư giãn cột sống',
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
      status: PlanScheduleStatus.completed,
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
      status: PlanScheduleStatus.completed,
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
