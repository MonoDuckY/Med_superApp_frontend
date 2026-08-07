import '../../core/models/api_response.dart';
import '../../models/dto/medicine_schedule_response.dart';

abstract class MedicineScheduleServiceAbstract {
  Future<ApiResponse<List<MedicineScheduleResponse>>> getMedicineSchedules();
  
  Future<ApiResponse<MedicineScheduleResponse>> updateScheduleTime(
      String scheduleId, DateTime newTime);
      
  Future<ApiResponse<MedicineScheduleResponse>> markTaken(String scheduleId);
}
