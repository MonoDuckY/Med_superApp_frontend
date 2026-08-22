import 'package:dio/dio.dart';
import 'api_client.dart';
import '../../models/dto/appointment_response.dart';
import '../../models/dto/available_appointment_slot_response.dart';
import '../../models/dto/book_appointment_request.dart';
import '../../models/dto/patient_doctor_response.dart';
import '../abstract/appointment_service_abstract.dart';

class RemoteAppointmentService implements IAppointmentService {
  final Dio _dio = ApiClient.instance;

  /// Lấy danh sách các khung giờ trống.
  /// Có thể filter theo date hoặc doctorName (hoặc cả hai).
  @override
  Future<List<AvailableAppointmentSlotResponse>> getAvailableSlots({
    String? date,
    String? doctorName,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (date != null) queryParams['date'] = date;
      if (doctorName != null) queryParams['doctorName'] = doctorName;

      final response = await _dio.get(
        '/api/patient/appointments/available-slots',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        return data
            .map((json) => AvailableAppointmentSlotResponse.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      // Bỏ qua lỗi hoặc log
      return [];
    }
  }

  /// Đặt lịch khám
  @override
  Future<AppointmentResponse> bookAppointment(
      BookAppointmentRequest request) async {
    try {
      final response = await _dio.post(
        '/api/patient/appointments',
        data: request.toJson(),
      );

      if (response.data['success'] == true) {
        return AppointmentResponse.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Đặt lịch thất bại.');
    } on DioException catch (e) {
      if (e.response != null && e.response?.data != null) {
        final message = e.response?.data['message'];
        if (message != null) {
          throw Exception(message);
        }
      }
      throw Exception('Lỗi mạng. Đặt lịch thất bại.');
    } catch (e) {
      throw Exception('Lỗi hệ thống. Đặt lịch thất bại.');
    }
  }

  /// Lấy danh sách lịch khám của bệnh nhân
  @override
  Future<List<AppointmentResponse>> getPatientAppointments() async {
    try {
      final response = await _dio.get('/api/patient/appointments');

      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        return data.map((json) => AppointmentResponse.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Lấy danh sách bác sĩ (Dùng cho tab Đặt theo bác sĩ)
  @override
  Future<List<PatientDoctorResponse>> getDoctors() async {
    try {
      final response = await _dio.get('/api/patient/doctors');

      if (response.data['success'] == true) {
        final List data = response.data['data'] ?? [];
        return data.map((json) => PatientDoctorResponse.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Hủy lịch khám (Bệnh nhân tự hủy)
  @override
  Future<void> cancelAppointment(String appointmentId, String reason) async {
    try {
      final response = await _dio.patch(
        '/api/patient/appointments/$appointmentId/cancel',
        data: {
          'cancellationReason': reason,
        },
      );

      if (response.data is Map && response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Lỗi khi hủy lịch');
      }
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        final message = e.response?.data['message'];
        if (message != null && message.toString().isNotEmpty) {
          throw Exception(message.toString());
        }
      }
      throw Exception(e.message ?? 'Lỗi mạng. Không thể hủy lịch.');
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Lỗi hệ thống. Không thể hủy lịch.');
    }
  }
}
