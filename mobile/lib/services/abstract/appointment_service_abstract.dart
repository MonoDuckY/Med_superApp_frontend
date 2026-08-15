import '../../models/dto/appointment_response.dart';
import '../../models/dto/available_appointment_slot_response.dart';
import '../../models/dto/book_appointment_request.dart';
import '../../models/dto/patient_doctor_response.dart';

abstract class IAppointmentService {
  Future<List<AvailableAppointmentSlotResponse>> getAvailableSlots({
    String? date,
    String? doctorName,
  });

  Future<AppointmentResponse> bookAppointment(BookAppointmentRequest request);

  Future<List<AppointmentResponse>> getPatientAppointments();

  Future<List<PatientDoctorResponse>> getDoctors();

  Future<void> cancelAppointment(String appointmentId, String reason);
}
