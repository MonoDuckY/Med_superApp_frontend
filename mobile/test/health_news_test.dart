import 'package:flutter_test/flutter_test.dart';
import 'package:med_superapp_frontend/models/dto/news_response.dart';
import 'package:med_superapp_frontend/models/health_news_model.dart';
import 'package:med_superapp_frontend/services/mock/mock_health_news_service.dart';
import 'package:med_superapp_frontend/view_models/health_news_viewmodel.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Health News DTO Tests', () {
    test('NewsResponseDto correctly parses JSON with coverPhoto and image attachments', () {
      final json = {
        'newsId': 'news-999',
        'title': 'Phương pháp kiểm soát đường huyết và dinh dưỡng hợp lý',
        'content':
            'Chế độ dinh dưỡng đóng vai trò rất quan trọng đối với người bệnh tiểu đường. '
            'Việc chia nhỏ bữa ăn và hạn chế tinh bột hấp thu nhanh sẽ giúp đường huyết ổn định.',
        'uploadBy': 'BS. CKII Nguyễn Thị Lan',
        'coverPhoto': {
          'url': 'https://s3.aws.com/news-999-cover.jpg',
          'expiresAt': '2026-08-21T18:00:00.000Z',
        },
        'image': [
          {
            'url': 'https://s3.aws.com/news-999-img1.jpg',
            'expiresAt': '2026-08-21T18:00:00.000Z',
          }
        ],
        'status': 'PUBLISHED',
        'uploadTime': '2026-08-21T10:00:00.000Z',
      };

      final dto = NewsResponseDto.fromJson(json);

      expect(dto.newsId, 'news-999');
      expect(dto.title, 'Phương pháp kiểm soát đường huyết và dinh dưỡng hợp lý');
      expect(dto.uploadBy, 'BS. CKII Nguyễn Thị Lan');
      expect(dto.displayAuthor, 'BS. CKII Nguyễn Thị Lan');
      expect(dto.coverPhoto?.url, 'https://s3.aws.com/news-999-cover.jpg');
      expect(dto.image.length, 1);
      expect(dto.image.first.url, 'https://s3.aws.com/news-999-img1.jpg');
      expect(dto.category, 'Dinh dưỡng');
      expect(dto.summary, contains('Chế độ dinh dưỡng đóng vai trò rất quan trọng'));
      expect(dto.estimatedReadTime, '1 phút đọc');
    });

    test('HealthNewsArticle converts seamlessly to and from NewsResponseDto', () {
      final dto = NewsResponseDto(
        newsId: 'news-100',
        title: 'Tập luyện thể thao cho bệnh nhân tim mạch',
        content: 'Các bài tập nhẹ như đi bộ và yoga giúp cải thiện tuần hoàn tim mạch hiệu quả.',
        uploadBy: 'STAFF_001',
        coverPhoto: const NewsAttachmentDto(url: 'https://example.com/cover.png'),
        status: 'PUBLISHED',
        uploadTime: DateTime(2026, 8, 20, 15, 0),
      );

      final article = HealthNewsArticle.fromDto(dto);

      expect(article.id, 'news-100');
      expect(article.category, 'Tim mạch');
      expect(article.coverUrl, 'https://example.com/cover.png');
      expect(article.author, 'Bác sĩ / Nhân viên STAFF_001');

      final backToDto = article.toDto();
      expect(backToDto.newsId, 'news-100');
      expect(backToDto.coverPhoto?.url, 'https://example.com/cover.png');
    });
  });

  group('MockHealthNewsService Tests', () {
    final service = MockHealthNewsService();

    test('getPublishedNews returns mock list with valid articles', () async {
      final list = await service.getPublishedNews();
      expect(list.isNotEmpty, isTrue);
      expect(list.first.newsId, 'news-001');
      expect(list.first.status, 'PUBLISHED');
    });

    test('getNewsDetail returns specific article or null if not found', () async {
      final article = await service.getNewsDetail('news-001');
      expect(article, isNotNull);
      expect(article!.title, '5 thói quen buổi sáng giúp ổn định huyết áp');

      final notFound = await service.getNewsDetail('unknown-id');
      expect(notFound, isNull);
    });
  });

  group('HealthNewsViewModel Tests', () {
    test('loadNews populates articles and filter works correctly', () async {
      final vm = HealthNewsViewModel(newsService: MockHealthNewsService());
      expect(vm.isLoading, isFalse);

      await vm.loadNews();
      expect(vm.articles.isNotEmpty, isTrue);
      expect(vm.filteredArticles.length, vm.articles.length);

      // Filter by 'Tim mạch'
      vm.setCategory('Tim mạch');
      expect(vm.selectedCategory, 'Tim mạch');
      for (final a in vm.filteredArticles) {
        expect(a.category, 'Tim mạch');
      }

      // Reset to 'Tất cả'
      vm.setCategory('Tất cả');
      expect(vm.filteredArticles.length, vm.articles.length);
    });

    test('loadDetail retrieves single article into selectedArticle', () async {
      final vm = HealthNewsViewModel(newsService: MockHealthNewsService());

      await vm.loadDetail('news-002');
      expect(vm.selectedArticle, isNotNull);
      expect(vm.selectedArticle!.newsId, 'news-002');
      expect(vm.selectedArticle!.category, 'Dinh dưỡng');
    });
  });
}
