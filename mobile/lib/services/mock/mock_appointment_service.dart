import '../../models/dto/appointment_response.dart';
import '../../models/dto/available_appointment_slot_response.dart';
import '../../models/dto/book_appointment_request.dart';
import '../../models/dto/patient_doctor_response.dart';
import '../abstract/appointment_service_abstract.dart';

class MockAppointmentService implements IAppointmentService {
  @override
  Future<List<AvailableAppointmentSlotResponse>> getAvailableSlots({
    String? date,
    String? doctorName,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      AvailableAppointmentSlotResponse(
        doctorWorkSlotId: 'slot_1',
        doctorId: 'doc_1',
        doctorName: 'Dr. John Doe',
        workDate: date ?? '2026-08-11',
        slotId: 'time_1',
        roomId: 'room_101',
        startAt: '${date ?? '2026-08-11'}T08:00:00',
        endAt: '${date ?? '2026-08-11'}T08:30:00',
      ),
      AvailableAppointmentSlotResponse(
        doctorWorkSlotId: 'slot_2',
        doctorId: 'doc_2',
        doctorName: 'Dr. Jane Smith',
        workDate: date ?? '2026-08-11',
        slotId: 'time_2',
        roomId: 'room_102',
        startAt: '${date ?? '2026-08-11'}T09:00:00',
        endAt: '${date ?? '2026-08-11'}T09:30:00',
      ),
    ];
  }

  @override
  Future<AppointmentResponse> bookAppointment(BookAppointmentRequest request) async {
    await Future.delayed(const Duration(seconds: 1));
    return AppointmentResponse(
      id: 'app_1',
      patientId: 'patient_1',
      doctorWorkSlotId: request.doctorWorkSlotId,
      requestedAt: DateTime.now().toIso8601String(),
      status: 'CONFIRMED',
    );
  }

  @override
  Future<List<AppointmentResponse>> getPatientAppointments() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      AppointmentResponse(
        id: 'app_1',
        patientId: 'patient_1',
        doctorWorkSlotId: 'slot_1',
        requestedAt: DateTime.now().toIso8601String(),
        status: 'CONFIRMED',
      ),
      AppointmentResponse(
        id: 'app_2',
        patientId: 'patient_1',
        doctorWorkSlotId: 'slot_2',
        requestedAt: DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        status: 'COMPLETED',
      ),
    ];
  }

  @override
  Future<List<PatientDoctorResponse>> getDoctors() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      PatientDoctorResponse(
        id: 'doc_1',
        fullName: 'Dr. John Doe',
        phoneNumber: '0912345678',
      ),
      PatientDoctorResponse(
        id: 'doc_2',
        fullName: 'Dr. Jane Smith',
        phoneNumber: '0987654321',
      ),
    ];
  }

  @override
  Future<void> cancelAppointment(String appointmentId, String reason) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
