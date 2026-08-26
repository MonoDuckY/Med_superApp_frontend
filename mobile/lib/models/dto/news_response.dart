import 'package:intl/intl.dart';

/// DTO đính kèm cho hình ảnh trong bài viết tin tức (từ S3 Presigned URL).
class NewsAttachmentDto {
  final String url;
  final DateTime? expiresAt;

  const NewsAttachmentDto({
    required this.url,
    this.expiresAt,
  });

  factory NewsAttachmentDto.fromJson(Map<String, dynamic> json) {
    return NewsAttachmentDto(
      url: json['url'] as String? ?? '',
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'] as String)?.toLocal()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'expiresAt': expiresAt?.toUtc().toIso8601String(),
    };
  }
}

/// DTO phản hồi bài viết tin tức từ Backend API (`/api/patient/news`).
class NewsResponseDto {
  final String newsId;
  final String title;
  final String content;
  final String? uploadBy;
  final NewsAttachmentDto? coverPhoto;
  final List<NewsAttachmentDto> image;
  final String? status;
  final DateTime? uploadTime;

  const NewsResponseDto({
    required this.newsId,
    required this.title,
    required this.content,
    this.uploadBy,
    this.coverPhoto,
    this.image = const [],
    this.status,
    this.uploadTime,
  });

  factory NewsResponseDto.fromJson(Map<String, dynamic> json) {
    final rawImages = json['image'] as List<dynamic>? ?? [];
    return NewsResponseDto(
      newsId: json['newsId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      uploadBy: json['uploadBy'] as String?,
      coverPhoto: json['coverPhoto'] != null && json['coverPhoto'] is Map<String, dynamic>
          ? NewsAttachmentDto.fromJson(json['coverPhoto'] as Map<String, dynamic>)
          : null,
      image: rawImages
          .whereType<Map<String, dynamic>>()
          .map(NewsAttachmentDto.fromJson)
          .toList(),
      status: json['status'] as String?,
      uploadTime: json['uploadTime'] != null
          ? DateTime.tryParse(json['uploadTime'] as String)?.toLocal()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'newsId': newsId,
      'title': title,
      'content': content,
      'uploadBy': uploadBy,
      'coverPhoto': coverPhoto?.toJson(),
      'image': image.map((e) => e.toJson()).toList(),
      'status': status,
      'uploadTime': uploadTime?.toUtc().toIso8601String(),
    };
  }

  // ── Helper Getters & Domain Helpers ────────────────────────────────────────

  /// Tóm tắt bài viết trích từ đoạn đầu content
  String get summary {
    final cleanContent = content.replaceAll('\n', ' ').trim();
    if (cleanContent.length <= 130) {
      return cleanContent;
    }
    // Cắt tới dấu chấm gần nhất trong khoảng 60 - 130 ký tự nếu có
    final firstPeriod = cleanContent.indexOf('.', 60);
    if (firstPeriod != -1 && firstPeriod <= 130) {
      return cleanContent.substring(0, firstPeriod + 1);
    }
    return '${cleanContent.substring(0, 120)}...';
  }

  /// Ước lượng thời gian đọc dựa trên độ dài văn bản
  String get estimatedReadTime {
    final words = content.trim().split(RegExp(r'\s+')).length;
    final minutes = (words / 200).ceil();
    return '${minutes < 1 ? 1 : minutes} phút đọc';
  }

  /// Tác giả hiển thị
  String get displayAuthor {
    if (uploadBy == null || uploadBy!.isEmpty) {
      return 'Ban biên tập Y khoa';
    }
    if (uploadBy!.startsWith('BS') || uploadBy!.startsWith('ThS') || uploadBy!.startsWith('TS')) {
      return uploadBy!;
    }
    return 'Bác sĩ / Nhân viên $uploadBy';
  }

  /// Ngày xuất bản dạng hiển thị
  String get formattedPublishedDate {
    if (uploadTime == null) return '';
    return DateFormat('dd/MM/yyyy').format(uploadTime!);
  }

  /// Ngày xuất bản ngắn dạng dd/MM
  String get shortPublishedDate {
    if (uploadTime == null) return '';
    return DateFormat('dd/MM').format(uploadTime!);
  }

  /// Phân loại chủ đề thông minh dựa vào tiêu đề và nội dung bài viết
  String get category {
    final titleLower = title.toLowerCase();
    final contentLower = content.toLowerCase();

    // Ưu tiên kiểm tra từ khóa trên Tiêu đề bài viết
    if (titleLower.contains('dinh dưỡng') ||
        titleLower.contains('chế độ ăn') ||
        titleLower.contains('ăn uống') ||
        titleLower.contains('thực phẩm') ||
        titleLower.contains('mỡ máu')) {
      return 'Dinh dưỡng';
    }
    if (titleLower.contains('tim mạch') ||
        titleLower.contains('huyết áp') ||
        titleLower.contains('nhịp tim') ||
        titleLower.contains('đột quỵ')) {
      return 'Tim mạch';
    }
    if (titleLower.contains('phòng bệnh') ||
        titleLower.contains('tiêm chủng') ||
        titleLower.contains('khám định kỳ') ||
        titleLower.contains('triệu chứng')) {
      return 'Phòng bệnh';
    }
    if (titleLower.contains('lối sống') ||
        titleLower.contains('giấc ngủ') ||
        titleLower.contains('tập luyện') ||
        titleLower.contains('thói quen') ||
        titleLower.contains('thể thao')) {
      return 'Lối sống';
    }

    // Dự phòng kiểm tra trong nội dung
    if (contentLower.contains('dinh dưỡng') ||
        contentLower.contains('chế độ ăn') ||
        contentLower.contains('mỡ máu')) {
      return 'Dinh dưỡng';
    }
    if (contentLower.contains('tim mạch') ||
        contentLower.contains('huyết áp') ||
        contentLower.contains('nhịp tim')) {
      return 'Tim mạch';
    }
    if (contentLower.contains('phòng bệnh') ||
        contentLower.contains('tiêm chủng') ||
        contentLower.contains('khám định kỳ')) {
      return 'Phòng bệnh';
    }
    if (contentLower.contains('lối sống') ||
        contentLower.contains('giấc ngủ') ||
        contentLower.contains('tập luyện')) {
      return 'Lối sống';
    }
    return 'Sức khỏe';
  }
}
