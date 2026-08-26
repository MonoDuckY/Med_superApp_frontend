/// Tiện ích xử lý chuỗi HTML cho mobile.
class HtmlUtils {
  HtmlUtils._();

  /// Kiểm tra chuỗi có chứa thẻ HTML hay không
  static bool isHtml(String? text) {
    if (text == null || text.isEmpty) return false;
    return RegExp(r'<[a-z][\s\S]*>', caseSensitive: false).hasMatch(text);
  }

  /// Loại bỏ toàn bộ thẻ HTML và giải mã các ký tự HTML entities thông dụng
  static String stripHtml(String? html) {
    if (html == null || html.isEmpty) return '';

    var result = html;

    // Thay thế các thẻ ngắt dòng bằng khoảng trắng
    result = result.replaceAll(RegExp(r'<br\s*/?>|</p>|</li>|</div>', caseSensitive: false), ' ');

    // Xóa toàn bộ thẻ tag HTML còn lại
    result = result.replaceAll(RegExp(r'<[^>]*>'), '');

    // Giải mã các HTML entities thường gặp
    result = result
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&apos;', "'")
        .replaceAll('&ndash;', '–')
        .replaceAll('&mdash;', '—')
        .replaceAll('&hellip;', '...');

    // Rút gọn các khoảng trắng / tab / dòng trống thừa liên tiếp
    result = result.replaceAll(RegExp(r'\s+'), ' ').trim();

    return result;
  }
}
