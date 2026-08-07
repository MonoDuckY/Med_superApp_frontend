import 'medicine_schedule_response.dart';

/// Mock data tĩnh cho UC-10 — dùng trong khi backend hoàn thiện.
class MedicineScheduleMockData {
  MedicineScheduleMockData._();

  static List<MedicineScheduleResponse> generate() {
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
