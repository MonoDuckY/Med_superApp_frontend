import '../../core/models/api_response.dart';
import '../../models/dto/medicine_schedule_response.dart';
import '../abstract/medicine_schedule_service_abstract.dart';

class MockMedicineScheduleService implements MedicineScheduleServiceAbstract {
  static final List<MedicineScheduleResponse> _mockData = _generateMockData();

  @override
  Future<ApiResponse<List<MedicineScheduleResponse>>> getMedicineSchedules() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return ApiResponse.success(List.from(_mockData), message: 'Medicine schedules retrieved successfully.');
  }

  @override
  Future<ApiResponse<MedicineScheduleResponse>> updateScheduleTime(
      String scheduleId, DateTime newTime) async {
    await Future.delayed(const Duration(milliseconds: 400));
    
    if (!newTime.isAfter(DateTime.now())) {
      return ApiResponse.failure('Giờ uống mới phải trong tương lai.');
    }
    
    final idx = _mockData.indexWhere((s) => s.id == scheduleId);
    if (idx == -1) {
      return ApiResponse.failure('Không tìm thấy lịch.');
    }
    
    final schedule = _mockData[idx];
    if (schedule.status != MedicineScheduleStatus.notYet) {
      return ApiResponse.failure('Chỉ lịch chưa uống mới có thể đổi giờ.');
    }
    
    final duplicate = _mockData.any((s) =>
        s.id != scheduleId &&
        s.prescriptionId == schedule.prescriptionId &&
        s.medicineName == schedule.medicineName &&
        s.dosage == schedule.dosage &&
        s.scheduledAt.isAtSameMomentAs(newTime));
        
    if (duplicate) {
      return ApiResponse.failure('Đã có lịch uống cùng thuốc vào giờ này.');
    }

    final updatedSchedule = schedule.copyWith(scheduledAt: newTime);
    _mockData[idx] = updatedSchedule;
    
    return ApiResponse.success(updatedSchedule, message: 'Medicine schedule time updated successfully.');
  }

  @override
  Future<ApiResponse<MedicineScheduleResponse>> markTaken(String scheduleId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    
    final idx = _mockData.indexWhere((s) => s.id == scheduleId);
    if (idx == -1) {
      return ApiResponse.failure('Không tìm thấy lịch.');
    }
    
    final schedule = _mockData[idx];
    if (schedule.status != MedicineScheduleStatus.notYet) {
      return ApiResponse.failure('Chỉ có thể đánh dấu đã uống cho lịch chưa uống.');
    }
    
    final updatedSchedule = schedule.copyWith(status: MedicineScheduleStatus.taken);
    _mockData[idx] = updatedSchedule;
    
    return ApiResponse.success(updatedSchedule, message: 'Medicine marked as taken successfully.');
  }

  static List<MedicineScheduleResponse> _generateMockData() {
    final now = DateTime.now();
    final yesterday = DateTime(now.year, now.month, now.day - 1);
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = DateTime(now.year, now.month, now.day + 1);

    return [
      // ── HÔM QUA ─────────────────────────────────────────────────────────────
      MedicineScheduleResponse(
        id: 'mock-001',
        medicineName: 'Paracetamol',
        dosage: '500mg — 1 viên',
        scheduledAt: yesterday.add(const Duration(hours: 7)),
        status: MedicineScheduleStatus.taken,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa sáng',
      ),
      MedicineScheduleResponse(
        id: 'mock-002',
        medicineName: 'Amoxicillin',
        dosage: '250mg — 1 viên',
        scheduledAt: yesterday.add(const Duration(hours: 12)),
        status: MedicineScheduleStatus.taken,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa trưa',
      ),
      MedicineScheduleResponse(
        id: 'mock-003',
        medicineName: 'Vitamin C',
        dosage: '1000mg — 1 viên',
        scheduledAt: yesterday.add(const Duration(hours: 21)),
        status: MedicineScheduleStatus.missed,
        prescriptionId: 'rx-001',
        note: null,
      ),

      // ── HÔM NAY ─────────────────────────────────────────────────────────────
      MedicineScheduleResponse(
        id: 'mock-004',
        medicineName: 'Paracetamol',
        dosage: '500mg — 1 viên',
        scheduledAt: today.add(const Duration(hours: 7)),
        status: MedicineScheduleStatus.taken,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa sáng',
      ),
      MedicineScheduleResponse(
        id: 'mock-005',
        medicineName: 'Amoxicillin',
        dosage: '250mg — 1 viên',
        scheduledAt: today.add(const Duration(hours: 12)),
        status: MedicineScheduleStatus.taken,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa trưa',
      ),
      MedicineScheduleResponse(
        id: 'mock-006',
        medicineName: 'Omeprazole',
        dosage: '20mg — 1 viên',
        scheduledAt: today.add(const Duration(hours: 17, minutes: 30)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-002',
        note: 'Uống trước bữa tối 30 phút',
      ),
      MedicineScheduleResponse(
        id: 'mock-007',
        medicineName: 'Paracetamol',
        dosage: '500mg — 1 viên',
        scheduledAt: today.add(const Duration(hours: 21)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa tối',
      ),
      MedicineScheduleResponse(
        id: 'mock-008',
        medicineName: 'Vitamin C',
        dosage: '1000mg — 1 viên',
        scheduledAt: today.add(const Duration(hours: 21, minutes: 30)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-001',
        note: null,
      ),

      // ── NGÀY MAI ─────────────────────────────────────────────────────────────
      MedicineScheduleResponse(
        id: 'mock-009',
        medicineName: 'Amoxicillin',
        dosage: '250mg — 1 viên',
        scheduledAt: tomorrow.add(const Duration(hours: 7)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa sáng',
      ),
      MedicineScheduleResponse(
        id: 'mock-010',
        medicineName: 'Omeprazole',
        dosage: '20mg — 1 viên',
        scheduledAt: tomorrow.add(const Duration(hours: 11, minutes: 30)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-002',
        note: 'Uống trước bữa trưa 30 phút',
      ),
      MedicineScheduleResponse(
        id: 'mock-011',
        medicineName: 'Amoxicillin',
        dosage: '250mg — 1 viên',
        scheduledAt: tomorrow.add(const Duration(hours: 18)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-001',
        note: 'Uống sau bữa tối',
      ),
      MedicineScheduleResponse(
        id: 'mock-012',
        medicineName: 'Vitamin C',
        dosage: '1000mg — 1 viên',
        scheduledAt: tomorrow.add(const Duration(hours: 21)),
        status: MedicineScheduleStatus.notYet,
        prescriptionId: 'rx-001',
        note: null,
      ),
    ];
  }
}
