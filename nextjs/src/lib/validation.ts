export function validateLoginForm(
  username: string,
  password: string,
  pattern: RegExp,
  patternDescription: string
): string | null {
  // Empty State Check
  if (!username.trim() || !password.trim()) {
    return "Please fill in both Phonenumber and Password.";
  }

  // Pattern format check for active department
  if (!pattern.test(username.trim())) {
    return patternDescription;
  }

  // Passwords must be at least 6 characters
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  return null;
}
