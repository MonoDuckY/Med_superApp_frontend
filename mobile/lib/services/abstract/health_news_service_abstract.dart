import '../../models/dto/news_response.dart';

/// Interface trừu tượng cho dịch vụ tin tức y khoa (UC-12: View Health Articles).
abstract class IHealthNewsService {
  /// Lấy danh sách tin tức sức khỏe đã xuất bản dành cho bệnh nhân.
  Future<List<NewsResponseDto>> getPublishedNews();

  /// Lấy thông tin chi tiết một bài viết tin tức.
  Future<NewsResponseDto?> getNewsDetail(String newsId);
}
