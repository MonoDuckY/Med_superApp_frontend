import '../../core/models/api_response.dart';
import '../../models/dto/meal_response.dart';
import '../../models/dto/workout_response.dart';

/// UC-08 — Abstract interface cho dịch vụ kế hoạch chăm sóc sức khỏe.
abstract class CarePlanServiceAbstract {
  Future<ApiResponse<List<MealResponse>>> getMeals();

  Future<ApiResponse<MealResponse>> addMeal({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  });

  Future<ApiResponse<MealResponse>> completeMeal(String mealId);

  Future<ApiResponse<List<WorkoutResponse>>> getWorkouts();

  Future<ApiResponse<WorkoutResponse>> addWorkout({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  });

  Future<ApiResponse<WorkoutResponse>> completeWorkout(String workoutId);
}
