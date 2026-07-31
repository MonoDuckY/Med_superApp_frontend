import 'package:flutter/material.dart';
import '../models/appointment_models.dart';
import '../models/dto/available_appointment_slot_response.dart';
import '../models/dto/book_appointment_request.dart';
import '../models/dto/patient_doctor_response.dart';
import '../services/remote/remote_appointment_service.dart';

enum BookingMode { byTime, byDoctor }

class AppointmentViewModel extends ChangeNotifier {
  final _service = RemoteAppointmentService();

  // ── Mode Selection ────────────────────────────────────────────────────────
  BookingMode _mode = BookingMode.byTime;
  BookingMode get mode => _mode;

  void setMode(BookingMode newMode) {
    if (_mode == newMode) return;
    _mode = newMode;
    _resetState();
    if (_mode == BookingMode.byDoctor && _allDoctors.isEmpty) {
      _fetchDoctors();
    }
    notifyListeners();
  }

  // ── Common State ──────────────────────────────────────────────────────────
  DateTime _focusedMonth = DateTime.now();
  DateTime get focusedMonth => _focusedMonth;

  DateTime? _selectedDate;
  DateTime? get selectedDate => _selectedDate;

  String _reason = '';
  String get reason => _reason;

  bool _isSubmitting = false;
  bool get isSubmitting => _isSubmitting;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  bool _bookingSuccess = false;
  bool get bookingSuccess => _bookingSuccess;

  // Raw API responses
  List<AvailableAppointmentSlotResponse> _availableSlotsResponse = [];

  // ── Tab 1: By Time State ──────────────────────────────────────────────────
  bool _isLoadingSlotsByTime = false;
  bool get isLoadingSlotsByTime => _isLoadingSlotsByTime;

  TimeSlot? _selectedTimeSlotByTime;
  TimeSlot? get selectedTimeSlotByTime => _selectedTimeSlotByTime;

  DoctorModel? _selectedDoctorByTime;
  DoctorModel? get selectedDoctorByTime => _selectedDoctorByTime;

  // ── Tab 2: By Doctor State ────────────────────────────────────────────────
  List<PatientDoctorResponse> _allDoctors = [];
  List<PatientDoctorResponse> get allDoctors => _allDoctors;

  bool _isLoadingDoctors = false;
  bool get isLoadingDoctors => _isLoadingDoctors;

  PatientDoctorResponse? _selectedDoctorByDoctorMode;
  PatientDoctorResponse? get selectedDoctorByDoctorMode => _selectedDoctorByDoctorMode;

  TimeSlot? _selectedTimeSlotByDoctor;
  TimeSlot? get selectedTimeSlotByDoctor => _selectedTimeSlotByDoctor;

  bool _isLoadingSlotsByDoctor = false;
  bool get isLoadingSlotsByDoctor => _isLoadingSlotsByDoctor;

  // ── Calendar Helpers ──────────────────────────────────────────────────────
  void previousMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
    notifyListeners();
  }

  void nextMonth() {
    _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1);
    notifyListeners();
  }

  // ── Actions: By Time ──────────────────────────────────────────────────────
  Future<void> selectDateByTime(DateTime date) async {
    final today = DateTime.now();
    final todayNormalized = DateTime(today.year, today.month, today.day);
    if (date.isBefore(todayNormalized)) return;

    _selectedDate = date;
    _selectedTimeSlotByTime = null;
    _selectedDoctorByTime = null;
    _isLoadingSlotsByTime = true;
    notifyListeners();

    final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    _availableSlotsResponse = await _service.getAvailableSlots(date: dateStr);
    
    _isLoadingSlotsByTime = false;
    notifyListeners();
  }

  void selectTimeSlotByTime(TimeSlot slot) {
    if (!slot.isAvailable) return;
    _selectedTimeSlotByTime = slot;
    _selectedDoctorByTime = null; // reset doctor
    notifyListeners();
  }

  void selectDoctorByTime(DoctorModel doctor) {
    _selectedDoctorByTime = doctor;
    notifyListeners();
  }

  // Derived getters for By Time
  List<TimeSlot> get timeSlotsForSelectedDate {
    if (_selectedDate == null) return [];
    
    // Group raw responses by startAt
    final map = <String, List<AvailableAppointmentSlotResponse>>{};
    for (var slot in _availableSlotsResponse) {
      map.putIfAbsent(slot.startAt, () => []).add(slot);
    }
    
    // Create UI TimeSlot objects
    final list = map.entries.map((e) {
      final timeStr = _parseTimeToHHmm(e.key);
      return TimeSlot(
        id: timeStr,
        time: timeStr,
        availableDoctors: e.value.length,
        isAvailable: e.value.isNotEmpty,
      );
    }).toList();
    
    list.sort((a, b) => a.time.compareTo(b.time));
    return list;
  }

  List<DoctorModel> get availableDoctorsForSelectedTime {
    if (_selectedTimeSlotByTime == null) return [];
    // Filter raw response where startAt matches selected time
    final matchedSlots = _availableSlotsResponse.where((s) => 
        _parseTimeToHHmm(s.startAt) == _selectedTimeSlotByTime!.id);
        
    return matchedSlots.map((s) => DoctorModel(
      id: s.doctorWorkSlotId, // using work slot ID as the unique identifier for booking
      name: s.doctorName,
      initials: _getInitials(s.doctorName),
    )).toList();
  }

  // ── Actions: By Doctor ────────────────────────────────────────────────────
  Future<void> _fetchDoctors() async {
    _isLoadingDoctors = true;
    notifyListeners();
    _allDoctors = await _service.getDoctors();
    _isLoadingDoctors = false;
    notifyListeners();
  }

  Future<void> selectDoctorByDoctorMode(PatientDoctorResponse doctor) async {
    _selectedDoctorByDoctorMode = doctor;
    _selectedDate = null;
    _selectedTimeSlotByDoctor = null;
    _isLoadingSlotsByDoctor = true;
    notifyListeners();

    _availableSlotsResponse = await _service.getAvailableSlots(doctorName: doctor.fullName);
    
    _isLoadingSlotsByDoctor = false;
    notifyListeners();
  }

  void selectDateByDoctor(DateTime date) {
    _selectedDate = date;
    _selectedTimeSlotByDoctor = null;
    notifyListeners();
  }

  void selectTimeSlotByDoctor(TimeSlot slot) {
    if (!slot.isAvailable) return;
    _selectedTimeSlotByDoctor = slot;
    notifyListeners();
  }

  // Derived getters for By Doctor
  List<DateTime> get availableDatesForSelectedDoctor {
    if (_selectedDoctorByDoctorMode == null) return [];
    final dates = _availableSlotsResponse.map((s) => DateTime.parse(s.workDate)).toSet().toList();
    dates.sort();
    return dates;
  }

  List<TimeSlot> get timeSlotsForDoctorAndDate {
    if (_selectedDoctorByDoctorMode == null || _selectedDate == null) return [];
    
    final dateStr = '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';
    
    final matchedSlots = _availableSlotsResponse.where((s) => s.workDate == dateStr);
    
    return matchedSlots.map((s) {
      final timeStr = _parseTimeToHHmm(s.startAt);
      return TimeSlot(
        id: s.doctorWorkSlotId, // use work slot ID here
        time: timeStr,
        availableDoctors: 1,
        isAvailable: true,
      );
    }).toList();
  }

  // ── Finalization ──────────────────────────────────────────────────────────
  void setReason(String value) {
    _reason = value;
    notifyListeners();
  }

  bool get canConfirm {
    if (_mode == BookingMode.byTime) {
      return _selectedDate != null && _selectedTimeSlotByTime != null && _selectedDoctorByTime != null;
    } else {
      return _selectedDoctorByDoctorMode != null && _selectedDate != null && _selectedTimeSlotByDoctor != null;
    }
  }

  Future<bool> confirmBooking() async {
    if (!canConfirm) return false;
    _isSubmitting = true;
    _errorMessage = null;
    notifyListeners();

    String workSlotIdToBook = '';
    
    if (_mode == BookingMode.byTime) {
      workSlotIdToBook = _selectedDoctorByTime!.id;
    } else {
      workSlotIdToBook = _selectedTimeSlotByDoctor!.id;
    }

    final request = BookAppointmentRequest(
      doctorWorkSlotId: workSlotIdToBook,
      note: _reason,
    );

    try {
      final result = await _service.bookAppointment(request);
      _bookingSuccess = true;
    } catch (e) {
      _bookingSuccess = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    }

    _isSubmitting = false;
    notifyListeners();
    return _bookingSuccess;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  void _resetState() {
    _selectedDate = null;
    _selectedTimeSlotByTime = null;
    _selectedDoctorByTime = null;
    _selectedDoctorByDoctorMode = null;
    _selectedTimeSlotByDoctor = null;
    _availableSlotsResponse = [];
    _reason = '';
    _bookingSuccess = false;
    _errorMessage = null;
  }

  String _parseTimeToHHmm(String isoString) {
    try {
      final dt = DateTime.parse(isoString).toLocal();
      return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return '00:00';
    }
  }

  String _getInitials(String name) {
    final parts = name.split(' ');
    if (parts.length > 1) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?';
  }
}
