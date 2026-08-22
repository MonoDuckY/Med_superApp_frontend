import 'dto/news_response.dart';

/// Domain model cho bài viết tin tức y tế hiển thị trên Mobile (UC-12).
class HealthNewsArticle {
  final String id;

  /// Nhãn phân loại bài viết (e.g. 'Tim mạch', 'Dinh dưỡng', 'Phòng bệnh', 'Lối sống').
  final String category;

  final String title;
  final String summary;
  final String? content;
  final String? author;

  /// Thời gian đọc ước tính (e.g. '3 phút đọc').
  final String readTime;

  final DateTime publishedAt;

  /// URL ảnh bìa (S3 Presigned URL)
  final String? coverUrl;

  /// Danh sách ảnh nội dung đính kèm
  final List<String> imageUrls;

  const HealthNewsArticle({
    required this.id,
    required this.category,
    required this.title,
    required this.summary,
    this.content,
    this.author,
    required this.readTime,
    required this.publishedAt,
    this.coverUrl,
    this.imageUrls = const [],
  });

  /// Chuyển đổi từ DTO Backend
  factory HealthNewsArticle.fromDto(NewsResponseDto dto) {
    return HealthNewsArticle(
      id: dto.newsId,
      category: dto.category,
      title: dto.title,
      summary: dto.summary,
      content: dto.content,
      author: dto.displayAuthor,
      readTime: dto.estimatedReadTime,
      publishedAt: dto.uploadTime ?? DateTime.now(),
      coverUrl: dto.coverPhoto?.url,
      imageUrls: dto.image.map((e) => e.url).toList(),
    );
  }

  /// Chuyển sang DTO
  NewsResponseDto toDto() {
    return NewsResponseDto(
      newsId: id,
      title: title,
      content: content ?? summary,
      uploadBy: author,
      coverPhoto: coverUrl != null ? NewsAttachmentDto(url: coverUrl!) : null,
      image: imageUrls.map((u) => NewsAttachmentDto(url: u)).toList(),
      status: 'PUBLISHED',
      uploadTime: publishedAt,
    );
  }
}
