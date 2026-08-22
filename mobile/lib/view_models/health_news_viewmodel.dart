import 'package:flutter/foundation.dart';
import '../core/config/environment_config.dart';
import '../models/dto/news_response.dart';
import '../services/abstract/health_news_service_abstract.dart';
import '../services/mock/mock_health_news_service.dart';
import '../services/remote/remote_health_news_service.dart';

class HealthNewsViewModel extends ChangeNotifier {
  final IHealthNewsService _newsService;

  HealthNewsViewModel({IHealthNewsService? newsService})
      : _newsService = newsService ??
            (EnvironmentConfig.isMock
                ? MockHealthNewsService()
                : RemoteHealthNewsService());

  // ── State ──────────────────────────────────────────────────────────────────
  bool _isLoading = false;
  String? _errorMessage;
  List<NewsResponseDto> _articles = [];
  String _selectedCategory = 'Tất cả';

  NewsResponseDto? _selectedArticle;
  bool _isDetailLoading = false;
  String? _detailErrorMessage;

  static const List<String> availableCategories = [
    'Tất cả',
    'Tim mạch',
    'Dinh dưỡng',
    'Phòng bệnh',
    'Lối sống',
  ];

  // ── Getters ────────────────────────────────────────────────────────────────
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<NewsResponseDto> get articles => _articles;
  String get selectedCategory => _selectedCategory;
  List<String> get categories => availableCategories;

  NewsResponseDto? get selectedArticle => _selectedArticle;
  bool get isDetailLoading => _isDetailLoading;
  String? get detailErrorMessage => _detailErrorMessage;

  List<NewsResponseDto> get filteredArticles {
    if (_selectedCategory == 'Tất cả') {
      return _articles;
    }
    return _articles
        .where((a) => a.category.toLowerCase() == _selectedCategory.toLowerCase())
        .toList();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /// Tải danh sách bài viết tin tức
  Future<void> loadNews({bool refresh = false}) async {
    if (_isLoading && !refresh) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final list = await _newsService.getPublishedNews();
      _articles = list;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Thay đổi bộ lọc danh mục
  void setCategory(String category) {
    if (_selectedCategory == category) return;
    _selectedCategory = category;
    notifyListeners();
  }

  /// Tải chi tiết một bài viết theo ID
  Future<void> loadDetail(String newsId) async {
    // Nếu trong danh sách đã có, hiển thị trước để tăng độ mượt
    final cached = _articles.where((a) => a.newsId == newsId).firstOrNull;
    if (cached != null) {
      _selectedArticle = cached;
      notifyListeners();
    }

    _isDetailLoading = true;
    _detailErrorMessage = null;
    notifyListeners();

    try {
      final detail = await _newsService.getNewsDetail(newsId);
      if (detail != null) {
        _selectedArticle = detail;
      } else if (_selectedArticle == null) {
        _detailErrorMessage = 'Không tìm thấy bài viết.';
      }
    } catch (e) {
      if (_selectedArticle == null) {
        _detailErrorMessage = e.toString().replaceAll('Exception: ', '');
      }
    } finally {
      _isDetailLoading = false;
      notifyListeners();
    }
  }
}
