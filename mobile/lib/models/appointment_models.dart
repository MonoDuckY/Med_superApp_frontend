import 'package:flutter/material.dart';
import '../core/app_colors.dart';

// ── Time Slot ─────────────────────────────────────────────────────────────────

class TimeSlot {
  final String id;
  final String time; // format "HH:mm"
  final int availableDoctors;
  final bool isAvailable;

  const TimeSlot({
    required this.id,
    required this.time,
    required this.availableDoctors,
    required this.isAvailable,
  });
}

// ── Doctor Model ──────────────────────────────────────────────────────────────

class DoctorModel {
  final String id;
  final String name;
  final String initials;
  final String specialty;
  final String? phoneNumber;
  final Color avatarColor;
  final Color specialtyColor;

  const DoctorModel({
    required this.id,
    required this.name,
    required this.initials,
    this.specialty = 'Khám bệnh', // Default fallback
    this.phoneNumber,
    this.avatarColor = AppColors.primary,
    this.specialtyColor = AppColors.primary,
  });
}

// ── Appointment Draft (transient booking state) ───────────────────────────────

class AppointmentDraft {
  DateTime? selectedDate;
  TimeSlot? selectedSlot;
  DoctorModel? selectedDoctor;
  String reason;
  String? doctorWorkSlotId; // The ID required by backend for booking

  AppointmentDraft({
    this.selectedDate,
    this.selectedSlot,
    this.selectedDoctor,
    this.reason = '',
    this.doctorWorkSlotId,
  });
}

// ── Appointment Record (for appointments list screen) ─────────────────────────

enum AppointmentStatus {
  pending('Chờ xác nhận'),
  confirmed('Đã xác nhận'),
  completed('Đã khám'),
  cancelled('Đã hủy');

  final String label;
  const AppointmentStatus(this.label);
}

class AppointmentRecord {
  final String id;
  final String specialty;
  final String doctorName;
  final String location;
  final DateTime dateTime;
  final AppointmentStatus status;

  const AppointmentRecord({
    required this.id,
    this.specialty = 'Khám bệnh',
    required this.doctorName,
    this.location = 'Phòng khám',
    required this.dateTime,
    required this.status,
  });
}

/// Lightweight view-model data class representing the next upcoming
/// appointment displayed on the Home screen hero card.
/// Populated from mock data until a dedicated API endpoint is available.
class NextAppointmentInfo {
  final String doctorName;
  final String specialty;
  final String location;
  final DateTime dateTime;
  final String status;

  const NextAppointmentInfo({
    required this.doctorName,
    required this.specialty,
    required this.location,
    required this.dateTime,
    required this.status,
  });
}
