/// Model for a health-news article displayed on the Home screen.
/// When the News feature is fully implemented, this model will be
/// populated from the remote API; for now it is served by
/// [MockHealthNewsService].
class HealthNewsArticle {
  final String id;

  /// Category label shown as a badge (e.g. 'Tim mạch', 'Dinh dưỡng').
  final String category;

  final String title;
  final String summary;
  final String? content;
  final String? author;

  /// Human-readable read time (e.g. '3 phút đọc').
  final String readTime;

  final DateTime publishedAt;

  const HealthNewsArticle({
    required this.id,
    required this.category,
    required this.title,
    required this.summary,
    this.content,
    this.author,
    required this.readTime,
    required this.publishedAt,
  });
}
