export function validateLoginForm(
  username: string,
  password: string,
  pattern: RegExp,
  patternDescription: string
): string | null {
  // Empty State Check
  if (!username.trim() || !password.trim()) {
    return "Vui lòng điền đầy đủ cả Số điện thoại và Mật khẩu.";
  }

  // Pattern format check for active department
  if (!pattern.test(username.trim())) {
    return patternDescription;
  }

  // Passwords must be at least 6 characters
  if (password.length < 6) {
    return "Mật khẩu phải dài ít nhất 6 ký tự.";
  }

  return null;
}
