import '../../models/appointment_models.dart';

/// Abstract contract for all appointment-related API calls.
/// Swap [MockAppointmentService] ↔ [RemoteAppointmentService] via AppConstants.
abstract class AppointmentServiceAbstract {
  Future<List<TimeSlot>> getAvailableSlots(DateTime date);
  Future<List<DoctorModel>> getDoctorsForSlot(DateTime date, String slotId);
  Future<bool> createAppointment(AppointmentDraft draft);
  Future<List<AppointmentRecord>> getMyAppointments();
}
