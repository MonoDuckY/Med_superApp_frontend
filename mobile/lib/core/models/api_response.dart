/// Wrapper chuẩn cho mọi API response từ Backend.
/// Tương ứng với ApiResponse<T> trong Spring Boot.
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? errorCode;

  const ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errorCode,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success:   json['success'] as bool,
      message:   json['message'] as String,
      data:      fromJsonT != null && json['data'] != null
                   ? fromJsonT(json['data'])
                   : null,
      errorCode: json['errorCode'] as String?,
    );
  }

  /// Tạo response thành công (dùng cho mock)
  factory ApiResponse.success(T data, {String message = 'Success'}) {
    return ApiResponse<T>(success: true, message: message, data: data);
  }

  /// Tạo response lỗi (dùng cho mock)
  factory ApiResponse.failure(String message, {String? errorCode}) {
    return ApiResponse<T>(
      success: false,
      message: message,
      errorCode: errorCode,
    );
  }
}
