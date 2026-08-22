import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/appointment_models.dart';
import '../services/remote/remote_appointment_service.dart';
import '../services/mock/mock_appointment_service.dart';
import '../services/abstract/appointment_service_abstract.dart';
import '../core/config/environment_config.dart';
import '../core/constants/app_constants.dart';

/// Manages the Appointments List screen state.
class AppointmentsListViewModel extends ChangeNotifier {
  final IAppointmentService _service = EnvironmentConfig.isMock
      ? MockAppointmentService()
      : RemoteAppointmentService();

  DateTime _focusedMonth = DateTime.now();
  DateTime get focusedMonth => _focusedMonth;

  DateTime _selectedDate = DateTime.now();
  DateTime get selectedDate => _selectedDate;

  List<AppointmentRecord> _allAppointments = [];

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  String _userName = 'Khách';
  String get userName => _userName;

  // ── Derived getters ────────────────────────────────────────────────────────

  List<AppointmentRecord> get appointmentsForSelectedDate {
    return _allAppointments
        .where((a) =>
            a.dateTime.year == _selectedDate.year &&
            a.dateTime.month == _selectedDate.month &&
            a.dateTime.day == _selectedDate.day)
        .toList()
      ..sort((a, b) => a.dateTime.compareTo(b.dateTime));
  }

  /// Days in the focused month that have at least one appointment (for dot indicators).
  Set<int> get markedDays {
    return _allAppointments
        .where((a) =>
            a.dateTime.year == _focusedMonth.year &&
            a.dateTime.month == _focusedMonth.month)
        .map((a) => a.dateTime.day)
        .toSet();
  }

  int get totalAppointmentsThisMonth {
    return _allAppointments
        .where((a) =>
            a.dateTime.year == _focusedMonth.year &&
            a.dateTime.month == _focusedMonth.month)
        .length;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  Future<void> loadAppointments() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      var name = prefs.getString(AppConstants.keyUserName) ??
          prefs.getString(AppConstants.keyUserData) ??
          'Nguyễn Văn A';
      if (RegExp(r'^\d+$').hasMatch(name.trim())) {
        name = 'Nguyễn Văn A';
      }
      _userName = name;
    } catch (_) {}

    final responses = await _service.getPatientAppointments();
    
    // Map DTO to UI model
    _allAppointments = responses.map((res) {
      DateTime dt = DateTime.now();
      if (res.doctorWorkSlot != null && res.slot != null) {
        final dateStr = res.doctorWorkSlot!.workDate;
        String timeStr = res.slot!.startTime;
        
        // If the backend returns 'HH:mm', add ':00'. If it already has ':00', leave it.
        if (timeStr.length == 5) {
          timeStr = '$timeStr:00';
        }
        
        try {
          dt = DateTime.parse('${dateStr}T$timeStr');
        } catch (e) {
          // fallback
        }
      } else if (res.requestedAt != null) {
        try {
          dt = DateTime.parse(res.requestedAt!);
        } catch (e) {
          // fallback
        }
      }

      AppointmentStatus mappedStatus;
      switch (res.status) {
        case 'CONFIRMED':
          mappedStatus = AppointmentStatus.confirmed;
          break;
        case 'COMPLETED':
          mappedStatus = AppointmentStatus.completed;
          break;
        case 'CANCELLED':
        case 'REJECTED':
          mappedStatus = AppointmentStatus.cancelled;
          break;
        default:
          mappedStatus = AppointmentStatus.pending;
      }

      return AppointmentRecord(
        id: res.id,
        specialty: 'Khám bệnh', // Defaults for UI since backend doesn't provide
        doctorName: res.doctor?.fullName ?? 'Bác sĩ',
        location: (res.room?.roomName != null && res.room!.roomName.isNotEmpty) 
            ? '${res.room!.id} - ${res.room!.roomName}' 
            : 'Phòng khám',
        dateTime: dt,
        status: mappedStatus,
      );
    }).toList();

    _selectedDate = DateTime.now();

    _isLoading = false;
    notifyListeners();
  }

  void previousMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
    notifyListeners();
  }

  void nextMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1);
    notifyListeners();
  }

  void selectDate(DateTime date) {
    _selectedDate = date;
    notifyListeners();
  }

  Future<bool> cancelAppointment(String appointmentId, String reason) async {
    try {
      _errorMessage = null;
      await _service.cancelAppointment(appointmentId, reason);
      await loadAppointments();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }
}
