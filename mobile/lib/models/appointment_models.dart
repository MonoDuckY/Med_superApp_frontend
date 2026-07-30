import 'package:flutter/material.dart';

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
  final int experienceYears;
  final double rating;
  final int reviewCount;
  final String hospital;
  final Color avatarColor;
  final Color specialtyColor;
  final double depositAmount; // Tiền tạm ứng — dynamic per doctor

  const DoctorModel({
    required this.id,
    required this.name,
    required this.initials,
    required this.specialty,
    required this.experienceYears,
    required this.rating,
    required this.reviewCount,
    required this.hospital,
    required this.avatarColor,
    required this.specialtyColor,
    required this.depositAmount,
  });
}

// ── Payment Method ────────────────────────────────────────────────────────────

enum PaymentMethod {
  qrCode('QR Code / VietQR', 'Quét mã QR ngân hàng'),
  momo('Ví MoMo', 'Thanh toán qua ví điện tử'),
  bankTransfer('Chuyển khoản', 'Internet Banking / ATM'),
  visaMaster('Thẻ Visa / Master', 'Thanh toán thẻ quốc tế');

  final String label;
  final String subtitle;
  const PaymentMethod(this.label, this.subtitle);
}

// ── Appointment Draft (transient booking state across 3 steps) ────────────────

class AppointmentDraft {
  DateTime? selectedDate;
  TimeSlot? selectedSlot;
  DoctorModel? selectedDoctor;
  String reason;
  PaymentMethod? paymentMethod;

  AppointmentDraft({
    this.selectedDate,
    this.selectedSlot,
    this.selectedDoctor,
    this.reason = '',
    this.paymentMethod,
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
    required this.specialty,
    required this.doctorName,
    required this.location,
    required this.dateTime,
    required this.status,
  });
}
