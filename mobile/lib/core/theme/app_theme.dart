import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  // --- Color Palette (từ shared/design-tokens/tokens.json) ---
  static const Color primary       = Color(0xFF2563EB); // blue-600
  static const Color primaryDark   = Color(0xFF1D4ED8); // blue-700
  static const Color teal          = Color(0xFF0D9488); // teal-600
  static const Color tealLight     = Color(0xFF14B8A6); // teal-500
  static const Color success       = Color(0xFF22C55E);
  static const Color warning       = Color(0xFFF59E0B);
  static const Color error         = Color(0xFFEF4444);
  static const Color surface       = Color(0xFFF9FAFB); // neutral-50
  static const Color surfaceDark   = Color(0xFF1F2937); // neutral-800

  // --- Light Theme ---
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: teal,
      brightness: Brightness.light,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      centerTitle: false,
      backgroundColor: Colors.white,
      foregroundColor: Color(0xFF111827),
      elevation: 0,
      scrolledUnderElevation: 1,
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: const Color(0xFFE5E7EB)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFFF9FAFB),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
      ),
    ),
  );

  // --- Dark Theme ---
  static ThemeData get dark => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: teal,
      brightness: Brightness.dark,
    ),
    fontFamily: 'Inter',
  );
}
