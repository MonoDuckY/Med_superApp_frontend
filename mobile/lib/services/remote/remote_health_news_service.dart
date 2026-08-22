import 'package:dio/dio.dart';
import '../../models/dto/news_response.dart';
import '../abstract/health_news_service_abstract.dart';
import 'api_client.dart';

/// Triển khai kết nối thực tế tới Spring Boot Backend (`/api/patient/news`).
class RemoteHealthNewsService implements IHealthNewsService {
  final Dio _dio;

  RemoteHealthNewsService({Dio? dio}) : _dio = dio ?? ApiClient.instance;

  @override
  Future<List<NewsResponseDto>> getPublishedNews() async {
    try {
      final response = await _dio.get('/api/patient/news');

      if (response.data != null && response.data['success'] == true) {
        final List rawList = response.data['data'] as List? ?? [];
        return rawList
            .whereType<Map<String, dynamic>>()
            .map(NewsResponseDto.fromJson)
            .toList();
      }

      return [];
    } on DioException catch (e) {
      final errorMsg = e.response?.data?['message'] ??
          'Không thể tải danh sách tin tức sức khỏe. Vui lòng thử lại sau.';
      throw Exception(errorMsg);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Đã xảy ra lỗi khi lấy danh sách bài viết: $e');
    }
  }

  @override
  Future<NewsResponseDto?> getNewsDetail(String newsId) async {
    try {
      final response = await _dio.get('/api/patient/news/$newsId');

      if (response.data != null && response.data['success'] == true) {
        final data = response.data['data'];
        if (data != null && data is Map<String, dynamic>) {
          return NewsResponseDto.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      final errorMsg = e.response?.data?['message'] ??
          'Không thể tải chi tiết bài viết. Vui lòng thử lại sau.';
      throw Exception(errorMsg);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Đã xảy ra lỗi khi lấy chi tiết bài viết: $e');
    }
  }
}
