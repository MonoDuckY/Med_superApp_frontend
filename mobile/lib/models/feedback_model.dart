// ── Feedback Model (UC-12) ────────────────────────────────────────────────────

/// Represents a completed appointment that can be reviewed
class CompletedAppointmentOption {
  final String id;
  final String specialty;
  final String doctorName;
  final DateTime completedAt;

  const CompletedAppointmentOption({
    required this.id,
    required this.specialty,
    required this.doctorName,
    required this.completedAt,
  });

  /// Human-readable label shown in the dropdown
  String get displayLabel {
    final d = completedAt;
    final day = d.day.toString().padLeft(2, '0');
    final month = d.month.toString().padLeft(2, '0');
    return '$specialty · $doctorName · $day/$month/${d.year}';
  }
}

// ── Highlight Tags ────────────────────────────────────────────────────────────

enum FeedbackHighlight {
  attentiveDoctor('Bác sĩ tận tâm'),
  longWait('Chờ đợi lâu'),
  goodFacilities('Cơ sở vật chất tốt'),
  friendlyStaff('Nhân viên thân thiện'),
  clearExplanation('Giải thích rõ ràng'),
  complicatedProcedures('Thủ tục phức tạp');

  final String label;
  const FeedbackHighlight(this.label);
}

// ── Feedback Draft (transient form state) ─────────────────────────────────────

class FeedbackDraft {
  CompletedAppointmentOption? selectedAppointment;
  int starRating; // 0 = not rated yet, 1–5
  Set<FeedbackHighlight> selectedHighlights;
  String comment;

  FeedbackDraft({
    this.selectedAppointment,
    this.starRating = 0,
    Set<FeedbackHighlight>? selectedHighlights,
    this.comment = '',
  }) : selectedHighlights = selectedHighlights ?? {};

  /// Validation: both appointment and a star rating are required to submit
  bool get isValid =>
      selectedAppointment != null && starRating > 0;

  /// Reset to empty state (used after successful submission)
  FeedbackDraft get cleared => FeedbackDraft();
}

// ── Star Rating Labels ────────────────────────────────────────────────────────

String starRatingLabel(int rating) {
  switch (rating) {
    case 1:
      return 'Rất tệ';
    case 2:
      return 'Tệ';
    case 3:
      return 'Bình thường';
    case 4:
      return 'Tốt';
    case 5:
      return 'Xuất sắc';
    default:
      return 'Chưa đánh giá';
  }
}
