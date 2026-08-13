import 'package:dio/dio.dart';
import '../../core/models/api_response.dart';
import '../../models/dto/meal_response.dart';
import '../../models/dto/workout_response.dart';
import '../abstract/care_plan_service_abstract.dart';
import 'api_client.dart';

/// UC-08 — Remote implementation gọi PatientCarePlanController trên backend.
class RemoteCarePlanService implements CarePlanServiceAbstract {
  final Dio _dio;

  RemoteCarePlanService({Dio? dio}) : _dio = dio ?? ApiClient.instance;

  // ── Meals ─────────────────────────────────────────────────────────────────

  @override
  Future<ApiResponse<List<MealResponse>>> getMeals() async {
    try {
      final response = await _dio.get('/api/patient/meal-plans');
      return ApiResponse<List<MealResponse>>.fromJson(
        response.data,
        (json) => (json as List)
            .map((e) => MealResponse.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi kết nối mạng.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<MealResponse>> addMeal({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  }) async {
    try {
      final response = await _dio.post(
        '/api/patient/meal-plans',
        data: {
          'mealName': mealName,
          'scheduledAt': scheduledAt.toUtc().toIso8601String(),
          'dishes': dishes,
          'note': note,
        }..removeWhere((_, v) => v == null),
      );
      return ApiResponse<MealResponse>.fromJson(
        response.data,
        (json) => MealResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi thêm bữa ăn.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<MealResponse>> completeMeal(String mealId) async {
    try {
      final response = await _dio.patch('/api/patient/meal-plans/$mealId/complete');
      return ApiResponse<MealResponse>.fromJson(
        response.data,
        (json) => MealResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi đánh dấu hoàn thành.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  // ── Workouts ──────────────────────────────────────────────────────────────

  @override
  Future<ApiResponse<List<WorkoutResponse>>> getWorkouts() async {
    try {
      final response = await _dio.get('/api/patient/workout-plans');
      return ApiResponse<List<WorkoutResponse>>.fromJson(
        response.data,
        (json) => (json as List)
            .map((e) => WorkoutResponse.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi kết nối mạng.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<WorkoutResponse>> addWorkout({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) async {
    try {
      final response = await _dio.post(
        '/api/patient/workout-plans',
        data: {
          'workoutName': workoutName,
          'scheduledAt': scheduledAt.toUtc().toIso8601String(),
          'content': content,
          'note': note,
        }..removeWhere((_, v) => v == null),
      );
      return ApiResponse<WorkoutResponse>.fromJson(
        response.data,
        (json) => WorkoutResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi thêm bài tập.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<WorkoutResponse>> completeWorkout(String workoutId) async {
    try {
      final response =
          await _dio.patch('/api/patient/workout-plans/$workoutId/complete');
      return ApiResponse<WorkoutResponse>.fromJson(
        response.data,
        (json) => WorkoutResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi đánh dấu hoàn thành.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }
}
