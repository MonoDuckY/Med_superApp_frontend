import 'package:flutter/material.dart';
import '../models/appointment_models.dart';
import '../services/mock/mock_appointment_service.dart';

/// Manages the Appointments List screen state.
/// Shares the [MockAppointmentService] singleton so newly booked
/// appointments from [AppointmentViewModel] appear here immediately.
class AppointmentsListViewModel extends ChangeNotifier {
  final _service = MockAppointmentService();

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

    _allAppointments = await _service.getMyAppointments();
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
