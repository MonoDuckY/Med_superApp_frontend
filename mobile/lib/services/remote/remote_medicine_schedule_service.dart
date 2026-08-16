import 'package:dio/dio.dart';
import '../../core/models/api_response.dart';
import '../../models/dto/medicine_schedule_response.dart';
import '../abstract/medicine_schedule_service_abstract.dart';
import 'api_client.dart';

class RemoteMedicineScheduleService implements MedicineScheduleServiceAbstract {
  final Dio _dio;

  RemoteMedicineScheduleService({Dio? dio}) : _dio = dio ?? ApiClient.instance;

  @override
  Future<ApiResponse<List<MedicineScheduleResponse>>> getMedicineSchedules() async {
    try {
      final response = await _dio.get('/api/patient/medicine-schedules');
      return ApiResponse<List<MedicineScheduleResponse>>.fromJson(
        response.data,
        (json) => (json as List)
            .map((e) => MedicineScheduleResponse.fromJson(e as Map<String, dynamic>))
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
  Future<ApiResponse<MedicineScheduleResponse>> updateScheduleTime(
      String scheduleId, DateTime newTime) async {
    try {
      final response = await _dio.patch(
        '/api/patient/medicine-schedules/$scheduleId/time',
        data: {
          'scheduledAt': newTime.toUtc().toIso8601String(),
        },
      );
      return ApiResponse<MedicineScheduleResponse>.fromJson(
        response.data,
        (json) => MedicineScheduleResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi cập nhật giờ uống thuốc.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }

  @override
  Future<ApiResponse<MedicineScheduleResponse>> markTaken(String scheduleId) async {
    try {
      final response = await _dio.patch(
        '/api/patient/medicine-schedules/$scheduleId/take',
      );
      return ApiResponse<MedicineScheduleResponse>.fromJson(
        response.data,
        (json) => MedicineScheduleResponse.fromJson(json as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      return ApiResponse.failure(
        e.response?.data?['message'] ?? 'Lỗi khi đánh dấu đã uống.',
        errorCode: e.response?.data?['errorCode'],
      );
    } catch (e) {
      return ApiResponse.failure('Đã xảy ra lỗi không xác định.');
    }
  }
}
