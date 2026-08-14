import '../../models/health_news_model.dart';

/// Mock implementation of the Health News service.
/// Returns a static list of [HealthNewsArticle] objects.
/// Replace with a real remote service when the News feature is live.
class MockHealthNewsService {
  static final List<HealthNewsArticle> _articles = [
    HealthNewsArticle(
      id: 'news-001',
      category: 'Tim mạch',
      title: '5 thói quen buổi sáng giúp ổn định huyết áp',
      summary:
          'Nghiên cứu mới cho thấy việc đi bộ nhẹ 15 phút sau khi thức dậy '
          'có thể giảm huyết áp tâm thu lên đến 8 mmHg.',
      readTime: '3 phút đọc',
      publishedAt: DateTime(2026, 8, 12),
    ),
    HealthNewsArticle(
      id: 'news-002',
      category: 'Dinh dưỡng',
      title: 'Chế độ ăn DASH — giải pháp cho người có mỡ máu cao',
      summary:
          'Chế độ ăn DASH được chứng minh giảm LDL-cholesterol hiệu quả '
          'sau 8 tuần áp dụng.',
      readTime: '5 phút đọc',
      publishedAt: DateTime(2026, 8, 10),
    ),
    HealthNewsArticle(
      id: 'news-003',
      category: 'Phòng bệnh',
      title: 'Khi nào cần đo nhịp tim thường xuyên hơn?',
      summary:
          'Các chuyên gia khuyến cáo người trên 40 tuổi nên theo dõi nhịp tim '
          'ít nhất 2 lần/tuần.',
      readTime: '4 phút đọc',
      publishedAt: DateTime(2026, 8, 8),
    ),
  ];

  /// Returns all mock health news articles.
  Future<List<HealthNewsArticle>> getArticles() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.unmodifiable(_articles);
  }
}
