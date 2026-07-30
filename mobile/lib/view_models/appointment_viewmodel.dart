import 'package:flutter/material.dart';
import '../models/appointment_models.dart';
import '../services/mock/mock_appointment_service.dart';

/// Manages the 3-step appointment booking flow.
/// Step 1 → pick date & time slot
/// Step 2 → pick doctor (loaded from selected slot)
/// Step 3 → confirm reason & payment method
class AppointmentViewModel extends ChangeNotifier {
  // Always use mock for now; replace factory line to swap to remote later.
  final _service = MockAppointmentService();

  // ── Step navigation ────────────────────────────────────────────────────────
  int _currentStep = 1;
  int get currentStep => _currentStep;

  // ── Step 1 state ───────────────────────────────────────────────────────────
  DateTime _focusedMonth = DateTime.now();
  DateTime get focusedMonth => _focusedMonth;

  DateTime? _selectedDate;
  DateTime? get selectedDate => _selectedDate;

  List<TimeSlot> _timeSlots = [];
  List<TimeSlot> get timeSlots => _timeSlots;

  TimeSlot? _selectedSlot;
  TimeSlot? get selectedSlot => _selectedSlot;

  bool _isLoadingSlots = false;
  bool get isLoadingSlots => _isLoadingSlots;

  // ── Step 2 state ───────────────────────────────────────────────────────────
  List<DoctorModel> _availableDoctors = [];
  List<DoctorModel> get availableDoctors => _availableDoctors;

  DoctorModel? _selectedDoctor;
  DoctorModel? get selectedDoctor => _selectedDoctor;

  bool _isLoadingDoctors = false;
  bool get isLoadingDoctors => _isLoadingDoctors;

  // ── Step 3 state ───────────────────────────────────────────────────────────
  String _reason = '';
  String get reason => _reason;

  PaymentMethod? _selectedPaymentMethod;
  PaymentMethod? get selectedPaymentMethod => _selectedPaymentMethod;

  // ── Shared state ───────────────────────────────────────────────────────────
  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool _bookingSuccess = false;
  bool get bookingSuccess => _bookingSuccess;

  // ── Calendar navigation ────────────────────────────────────────────────────
  void previousMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
    notifyListeners();
  }

  void nextMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1);
    notifyListeners();
  }

  // ── Step 1 actions ─────────────────────────────────────────────────────────
  Future<void> selectDate(DateTime date) async {
    final today = DateTime.now();
    final todayNormalized = DateTime(today.year, today.month, today.day);
    if (date.isBefore(todayNormalized)) return;

    _selectedDate = date;
    _selectedSlot = null;
    _availableDoctors = [];
    _selectedDoctor = null;
    _isLoadingSlots = true;
    notifyListeners();

    _timeSlots = await _service.getAvailableSlots(date);
    _isLoadingSlots = false;
    notifyListeners();
  }

  void selectSlot(TimeSlot slot) {
    if (!slot.isAvailable) return;
    _selectedSlot = slot;
    notifyListeners();
  }

  bool get canProceedStep1 =>
      _selectedDate != null && _selectedSlot != null;

  Future<void> goToStep2() async {
    if (!canProceedStep1) return;

    _isLoadingDoctors = true;
    notifyListeners();

    _availableDoctors =
        await _service.getDoctorsForSlot(_selectedDate!, _selectedSlot!.id);
    _isLoadingDoctors = false;
    _currentStep = 2;
    notifyListeners();
  }

  // ── Step 2 actions ─────────────────────────────────────────────────────────
  void selectDoctor(DoctorModel doctor) {
    _selectedDoctor = doctor;
    notifyListeners();
  }

  bool get canProceedStep2 => _selectedDoctor != null;

  void goToStep3() {
    if (!canProceedStep2) return;
    _currentStep = 3;
    notifyListeners();
  }

  // ── Step 3 actions ─────────────────────────────────────────────────────────
  void setReason(String value) {
    _reason = value;
    notifyListeners();
  }

  void selectPaymentMethod(PaymentMethod method) {
    _selectedPaymentMethod = method;
    notifyListeners();
  }

  bool get canConfirm => _selectedPaymentMethod != null;

  Future<bool> confirmBooking() async {
    if (!canConfirm) return false;
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    final draft = AppointmentDraft(
      selectedDate: _selectedDate,
      selectedSlot: _selectedSlot,
      selectedDoctor: _selectedDoctor,
      reason: _reason,
      paymentMethod: _selectedPaymentMethod,
    );

    final success = await _service.createAppointment(draft);

    _isSubmitting = false;
    _bookingSuccess = success;
    if (!success) {
      _errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại.';
    }
    notifyListeners();
    return success;
  }

  // ── Back navigation ────────────────────────────────────────────────────────
  /// Returns true if we navigated back within the flow,
  /// false if we're already on step 1 (caller should pop the route).
  bool goBack() {
    if (_currentStep > 1) {
      _currentStep--;
      notifyListeners();
      return true;
    }
    return false;
  }

  // ── Summary bar helpers ────────────────────────────────────────────────────
  String get summaryDate {
    if (_selectedDate == null) return '--/--/----';
    return '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}';
  }

  String get summaryTime => _selectedSlot?.time ?? '--:--';

  String get summaryDoctorName => _selectedDoctor?.name ?? '';

  // ── Currency helper ────────────────────────────────────────────────────────
  static String formatCurrency(double amount) {
    final intAmount = amount.toInt();
    final s = intAmount.toString();
    final buffer = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) buffer.write('.');
      buffer.write(s[i]);
    }
    return '${buffer.toString()}đ';
  }
}
