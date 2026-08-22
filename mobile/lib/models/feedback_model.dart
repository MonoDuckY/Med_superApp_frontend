// ── Feedback Model (UC-13) ────────────────────────────────────────────────────

/// Danh mục dịch vụ bệnh viện phục vụ đánh giá (Service Feedback)
class HospitalServiceOption {
  final String id;
  final String label;
  final String description;

  const HospitalServiceOption({
    required this.id,
    required this.label,
    required this.description,
  });

  static const List<HospitalServiceOption> defaultServices = [
    HospitalServiceOption(
      id: 'CLINICAL_QUALITY',
      label: 'Chất lượng khám chữa bệnh',
      description: 'Chuyên môn bác sĩ, tư vấn điều trị và hiệu quả khám',
    ),
    HospitalServiceOption(
      id: 'FACILITIES',
      label: 'Cơ sở vật chất & Trang thiết bị',
      description: 'Phòng khám, máy móc, vệ sinh và tiện nghi bệnh viện',
    ),
    HospitalServiceOption(
      id: 'BOOKING_RECEPTION',
      label: 'Dịch vụ đặt lịch & Tiếp đón',
      description: 'Quy trình tiếp nhận, hướng dẫn và thủ tục đăng ký',
    ),
    HospitalServiceOption(
      id: 'STAFF_ATTITUDE',
      label: 'Thái độ phục vụ của nhân viên',
      description: 'Sự nhiệt tình, chu đáo và tận tâm của nhân viên y tế',
    ),
    HospitalServiceOption(
      id: 'WAIT_TIME',
      label: 'Thời gian chờ đợi & Quy trình',
      description: 'Thời gian chờ khám, xét nghiệm và thủ tục hành chính',
    ),
    HospitalServiceOption(
      id: 'OTHER',
      label: 'Dịch vụ khác',
      description: 'Các ý kiến và đề xuất đóng góp khác',
    ),
  ];
}

// ── Highlight Tags ────────────────────────────────────────────────────────────

enum FeedbackHighlight {
  attentiveDoctor('Bác sĩ tận tâm'),
  clearExplanation('Giải thích rõ ràng'),
  goodFacilities('Cơ sở vật chất tốt'),
  friendlyStaff('Nhân viên thân thiện'),
  fastProcess('Quy trình nhanh gọn'),
  longWait('Chờ đợi lâu'),
  complicatedProcedures('Thủ tục phức tạp');

  final String label;
  const FeedbackHighlight(this.label);
}

// ── Feedback Item (Dữ liệu nhận từ Backend API) ───────────────────────────────

class FeedbackItem {
  final String feedbackId;
  final String? senderId;
  final String? receiverId;
  final String content;
  final String status;
  final int rating;
  final String serviceType;
  final String? response;

  const FeedbackItem({
    required this.feedbackId,
    this.senderId,
    this.receiverId,
    required this.content,
    required this.status,
    required this.rating,
    required this.serviceType,
    this.response,
  });

  factory FeedbackItem.fromJson(Map<String, dynamic> json) {
    return FeedbackItem(
      feedbackId: json['feedbackId']?.toString() ?? '',
      senderId: json['senderId']?.toString(),
      receiverId: json['receiverId']?.toString(),
      content: json['content']?.toString() ?? '',
      status: json['status']?.toString() ?? 'SUBMITTED',
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      serviceType: json['serviceType']?.toString() ?? '',
      response: json['response']?.toString(),
    );
  }

  bool get isResponded =>
      status.toUpperCase() == 'RESPONDED' || (response != null && response!.isNotEmpty);

  String get statusLabel => isResponded ? 'Đã phản hồi' : 'Chờ phản hồi';
}

// ── Feedback Draft (trạng thái form đang nhập) ────────────────────────────────

class FeedbackDraft {
  HospitalServiceOption? selectedService;
  int starRating; // 0 = chưa đánh giá, 1–5
  Set<FeedbackHighlight> selectedHighlights;
  String comment;

  FeedbackDraft({
    this.selectedService,
    this.starRating = 0,
    Set<FeedbackHighlight>? selectedHighlights,
    this.comment = '',
  }) : selectedHighlights = selectedHighlights ?? {};

  /// Validation: bắt buộc chọn dịch vụ và số sao > 0
  bool get isValid => selectedService != null && starRating > 0;

  /// Tạo bản sao trống để reset form
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
