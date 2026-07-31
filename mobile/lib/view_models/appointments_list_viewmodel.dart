import 'package:flutter/material.dart';
import '../models/appointment_models.dart';
import '../services/remote/remote_appointment_service.dart';

/// Manages the Appointments List screen state.
class AppointmentsListViewModel extends ChangeNotifier {
  final _service = RemoteAppointmentService();

  DateTime _focusedMonth = DateTime.now();
  DateTime get focusedMonth => _focusedMonth;

  DateTime _selectedDate = DateTime.now();
  DateTime get selectedDate => _selectedDate;

  List<AppointmentRecord> _allAppointments = [];

  bool _isLoading = false;
  bool get isLoading => _isLoading;

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
    notifyListeners();

    final responses = await _service.getPatientAppointments();
    
    // Map DTO to UI model
    _allAppointments = responses.map((res) {
      DateTime dt = DateTime.now();
      if (res.doctorWorkSlot != null && res.slot != null) {
        final dateStr = res.doctorWorkSlot!.workDate;
        final timeStr = res.slot!.startTime; // Assuming HH:mm format
        try {
          dt = DateTime.parse('${dateStr}T$timeStr:00');
        } catch (e) {
          // fallback
        }
      } else if (res.requestedAt != null) {
        dt = DateTime.parse(res.requestedAt!);
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
          mappedStatus = AppointmentStatus.cancelled;
          break;
        default:
          mappedStatus = AppointmentStatus.pending;
      }

      return AppointmentRecord(
        id: res.id,
        specialty: 'Khám bệnh', // Defaults for UI since backend doesn't provide
        doctorName: res.doctor?.fullName ?? 'Bác sĩ',
        location: res.room?.roomName ?? 'Phòng khám',
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
}
