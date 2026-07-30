import 'package:flutter/material.dart';
import '../../models/appointment_models.dart';
import '../abstract/appointment_service_abstract.dart';

/// Singleton mock service — both [AppointmentViewModel] and
/// [AppointmentsListViewModel] share the same instance so that a newly
/// booked appointment immediately appears in the list.
class MockAppointmentService implements AppointmentServiceAbstract {
  MockAppointmentService._internal();
  static final MockAppointmentService _instance =
      MockAppointmentService._internal();
  factory MockAppointmentService() => _instance;

  // ── Static doctor roster ──────────────────────────────────────────────────
  static final List<DoctorModel> _allDoctors = [
    const DoctorModel(
      id: 'dr1',
      name: 'BS. Trần Minh Khoa',
      initials: 'MK',
      specialty: 'Tim mạch can thiệp',
      experienceYears: 15,
      rating: 4.9,
      reviewCount: 312,
      hospital: 'BV Chợ Rẫy',
      avatarColor: Color(0xFF0EA5E9),
      specialtyColor: Color(0xFF0EA5E9),
      depositAmount: 150000,
    ),
    const DoctorModel(
      id: 'dr2',
      name: 'BS. Phạm Đức Hùng',
      initials: 'PH',
      specialty: 'Thần kinh học',
      experienceYears: 18,
      rating: 4.7,
      reviewCount: 178,
      hospital: 'BV Nhân dân 115',
      avatarColor: Color(0xFF7C3AED),
      specialtyColor: Color(0xFF7C3AED),
      depositAmount: 200000,
    ),
    const DoctorModel(
      id: 'dr3',
      name: 'BS. Võ Thị Thu',
      initials: 'VT',
      specialty: 'Nhãn khoa - Phẫu thuật',
      experienceYears: 10,
      rating: 4.9,
      reviewCount: 421,
      hospital: 'BV Mắt TP.HCM',
      avatarColor: Color(0xFFF59E0B),
      specialtyColor: Color(0xFFF59E0B),
      depositAmount: 180000,
    ),
  ];

  // ── Static time-slot roster ───────────────────────────────────────────────
  static const List<TimeSlot> _slots = [
    TimeSlot(id: 's1',  time: '07:30', availableDoctors: 0, isAvailable: false),
    TimeSlot(id: 's2',  time: '08:00', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's3',  time: '08:30', availableDoctors: 0, isAvailable: false),
    TimeSlot(id: 's4',  time: '09:00', availableDoctors: 3, isAvailable: true),
    TimeSlot(id: 's5',  time: '09:30', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's6',  time: '10:00', availableDoctors: 0, isAvailable: false),
    TimeSlot(id: 's7',  time: '10:30', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's8',  time: '11:00', availableDoctors: 3, isAvailable: true),
    TimeSlot(id: 's9',  time: '13:00', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's10', time: '13:30', availableDoctors: 0, isAvailable: false),
    TimeSlot(id: 's11', time: '14:00', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's12', time: '14:30', availableDoctors: 3, isAvailable: true),
    TimeSlot(id: 's13', time: '15:00', availableDoctors: 0, isAvailable: false),
    TimeSlot(id: 's14', time: '15:30', availableDoctors: 2, isAvailable: true),
    TimeSlot(id: 's15', time: '16:00', availableDoctors: 3, isAvailable: true),
  ];

  // ── Mutable appointment list (grows when createAppointment is called) ─────
  final List<AppointmentRecord> _appointments = () {
    final now = DateTime.now();
    return <AppointmentRecord>[
      AppointmentRecord(
        id: 'apt1',
        specialty: 'Tim mạch — Khám định kỳ',
        doctorName: 'BS. Trần Minh Khoa',
        location: 'Phòng 201 · BV Chợ Rẫy',
        dateTime: DateTime(now.year, now.month, 7, 9, 15),
        status: AppointmentStatus.confirmed,
      ),
      AppointmentRecord(
        id: 'apt2',
        specialty: 'Thần kinh học — Khám mới',
        doctorName: 'BS. Phạm Đức Hùng',
        location: 'Phòng 102 · BV Nhân dân 115',
        dateTime: DateTime(now.year, now.month, 14, 10, 0),
        status: AppointmentStatus.confirmed,
      ),
      AppointmentRecord(
        id: 'apt3',
        specialty: 'Nhãn khoa — Tái khám',
        doctorName: 'BS. Võ Thị Thu',
        location: 'Phòng 302 · BV Mắt TP.HCM',
        dateTime: DateTime(now.year, now.month, 21, 14, 30),
        status: AppointmentStatus.pending,
      ),
      AppointmentRecord(
        id: 'apt4',
        specialty: 'Tổng quát — Tái khám',
        doctorName: 'BS. Phạm Đức Hùng',
        location: 'Phòng 301 · BV Chợ Rẫy',
        dateTime: DateTime(now.year, now.month, 28, 9, 15),
        status: AppointmentStatus.pending,
      ),
    ];
  }();

  // ── AppointmentServiceAbstract impl ──────────────────────────────────────

  @override
  Future<List<TimeSlot>> getAvailableSlots(DateTime date) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_slots);
  }

  @override
  Future<List<DoctorModel>> getDoctorsForSlot(
      DateTime date, String slotId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final slot = _slots.firstWhere(
      (s) => s.id == slotId,
      orElse: () => _slots.first,
    );
    if (!slot.isAvailable) return [];
    if (slot.availableDoctors >= 3) return List.from(_allDoctors);
    return _allDoctors.take(slot.availableDoctors).toList();
  }

  @override
  Future<bool> createAppointment(AppointmentDraft draft) async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (draft.selectedDate == null ||
        draft.selectedSlot == null ||
        draft.selectedDoctor == null) {
      return false;
    }
    final parts = draft.selectedSlot!.time.split(':');
    _appointments.add(AppointmentRecord(
      id: 'apt_${DateTime.now().millisecondsSinceEpoch}',
      specialty: draft.selectedDoctor!.specialty,
      doctorName: draft.selectedDoctor!.name,
      location: draft.selectedDoctor!.hospital,
      dateTime: DateTime(
        draft.selectedDate!.year,
        draft.selectedDate!.month,
        draft.selectedDate!.day,
        int.parse(parts[0]),
        int.parse(parts[1]),
      ),
      status: AppointmentStatus.pending,
    ));
    return true;
  }

  @override
  Future<List<AppointmentRecord>> getMyAppointments() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_appointments);
  }
}
