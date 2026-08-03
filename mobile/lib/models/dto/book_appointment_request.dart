class BookAppointmentRequest {
  final String doctorWorkSlotId;
  final String? note;

  const BookAppointmentRequest({
    required this.doctorWorkSlotId,
    this.note,
  });

  Map<String, dynamic> toJson() => {
    'doctorWorkSlotId': doctorWorkSlotId,
    if (note != null) 'note': note,
  };
}
