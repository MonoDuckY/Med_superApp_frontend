import '../../models/health_news_model.dart';

/// Mock implementation of the Health News service (UC-12: View Health Articles).
/// Returns a static list of [HealthNewsArticle] objects.
class MockHealthNewsService {
  static final List<HealthNewsArticle> _articles = [
    HealthNewsArticle(
      id: 'news-001',
      category: 'Tim mạch',
      title: '5 thói quen buổi sáng giúp ổn định huyết áp',
      summary:
          'Nghiên cứu mới cho thấy việc đi bộ nhẹ 15 phút sau khi thức dậy '
          'có thể giảm huyết áp tâm thu lên đến 8 mmHg.',
      author: 'BS. CKII Nguyễn Thị Lan',
      content:
          'Huyết áp buổi sáng thường có xu hướng tăng nhẹ do cơ thể bắt đầu hoạt động trở lại sau giấc ngủ dài. Dưới đây là 5 thói quen đơn giản giúp bạn duy trì huyết áp ổn định:\n\n'
          '1. Uống một ly nước ấm ngay khi thức dậy: Nước giúp kích hoạt tuần hoàn máu, bù nước sau đêm dài và giảm độ nhớt của máu.\n\n'
          '2. Thức dậy từ từ: Tránh ngồi bật dậy đột ngột. Hãy nằm thư giãn vài phút, co duỗi nhẹ nhàng chân tay trước khi đứng lên.\n\n'
          '3. Đi bộ nhẹ nhàng 15 - 20 phút: Vận động nhẹ giúp mạch máu giãn nở và cải thiện độ nhạy của tim.\n\n'
          '4. Ăn sáng giàu chất xơ & ít muối: Yến mạch, chuối, trứng luộc là những lựa chọn tuyệt vời bổ sung kali và chất xơ hòa tan.\n\n'
          '5. Đo huyết áp vào khung giờ cố định: Ghi nhật ký chỉ số mỗi sáng giúp bác sĩ đánh giá chính xác hiệu quả điều trị.',
      readTime: '3 phút đọc',
      publishedAt: DateTime(2026, 8, 12),
    ),
    HealthNewsArticle(
      id: 'news-002',
      category: 'Dinh dưỡng',
      title: 'Chế độ ăn DASH — giải pháp cho người có mỡ máu cao',
      summary:
          'Chế độ ăn DASH được chứng minh giảm LDL-cholesterol hiệu quả '
          'sau 8 tuần áp dụng khoa học.',
      author: 'ThS. BS Trần Văn Hải',
      content:
          'Chế độ ăn DASH (Dietary Approaches to Stop Hypertension) ban đầu được thiết kế cho người tăng huyết áp, nhưng cũng mang lại hiệu quả vượt trội trong việc hạ mỡ máu và cải thiện sức khỏe tim mạch.\n\n'
          'Các nguyên tắc cốt lõi của DASH:\n'
          '• Tăng cường rau củ quả tươi (4-5 phần/ngày): Cung cấp dồi dào kali, magie và chất chống oxy hóa.\n\n'
          '• Ưu tiên ngũ cốc nguyên hạt: Gạo lứt, yến mạch, bánh mì nguyên cám giúp giảm hấp thu cholesterol xấu tại ruột.\n\n'
          '• Chọn chất béo lành mạnh: Dầu olive, quả bơ, các loại hạt (hạnh nhân, óc chó) và cá béo (cá hồi, cá trích).\n\n'
          '• Hạn chế muối và đường tinh luyện: Giữ lượng natri tiêu thụ dưới 2.300mg mỗi ngày (tương đương 1 thìa cà phê muối).',
      readTime: '5 phút đọc',
      publishedAt: DateTime(2026, 8, 10),
    ),
    HealthNewsArticle(
      id: 'news-003',
      category: 'Phòng bệnh',
      title: 'Khi nào bạn cần đo nhịp tim thường xuyên hơn?',
      summary:
          'Các chuyên gia khuyến cáo người trên 40 tuổi hoặc có tiền sử tim mạch '
          'nên theo dõi nhịp tim ít nhất 2 lần/tuần.',
      author: 'BS. CKII Lê Hoàng Nam',
      content:
          'Nhịp tim lúc nghỉ ngơi bình thường ở người trưởng thành dao động từ 60 đến 100 nhịp/phút. Tuy nhiên, bạn nên chú ý theo dõi sát sao hơn trong các trường hợp sau:\n\n'
          '1. Cảm giác hồi hộp, đánh trống ngực: Nhịp tim đột ngột tăng nhanh hoặc bỏ nhịp khi nghỉ ngơi.\n\n'
          '2. Bắt đầu chế độ tập luyện mới: Đo nhịp tim giúp kiểm soát vùng nhịp tim an toàn (Target Heart Rate Zone).\n\n'
          '3. Đang sử dụng thuốc tim mạch: Một số nhóm thuốc có thể làm chậm nhịp tim dưới 50 nhịp/phút (như chẹn Beta).\n\n'
          '4. Mệt mỏi, chóng mặt không rõ nguyên nhân: Có thể là dấu hiệu của rối loạn nhịp tim hoặc thiếu máu cơ tim.',
      readTime: '4 phút đọc',
      publishedAt: DateTime(2026, 8, 8),
    ),
    HealthNewsArticle(
      id: 'news-004',
      category: 'Lối sống',
      title: 'Giấc ngủ chất lượng — Chìa khóa tái tạo hệ miễn dịch',
      summary:
          'Ngủ đủ 7-8 tiếng mỗi đêm giúp cơ thể sản sinh cytokine bảo vệ cơ thể khỏi nhiễm trùng và viêm nhiễm.',
      author: 'BS. Phạm Minh Quân',
      content:
          'Nhiều nghiên cứu chỉ ra rằng những người ngủ ít hơn 6 tiếng mỗi đêm có nguy cơ mắc bệnh cảm cúm và viêm nhiễm cao gấp 4 lần so với người ngủ đủ 7 tiếng trở lên.\n\n'
          'Để có giấc ngủ ngon:\n'
          '• Tránh sử dụng màn hình điện thoại/máy tính ít nhất 30 phút trước khi đi ngủ.\n'
          '• Giữ nhiệt độ phòng mát mẻ, thoáng khí (24-26°C).\n'
          '• Không uống đồ có cồn hoặc caffeine sau 16:00.',
      readTime: '4 phút đọc',
      publishedAt: DateTime(2026, 8, 5),
    ),
  ];

  /// Returns all mock health news articles.
  Future<List<HealthNewsArticle>> getArticles() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return List.unmodifiable(_articles);
  }

  /// Get article by ID.
  Future<HealthNewsArticle?> getArticleById(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _articles.firstWhere((a) => a.id == id);
    } catch (_) {
      return null;
    }
  }
}
