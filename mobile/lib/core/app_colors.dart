import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Colors (HMS Standards)
  static const Color primary = Color(0xFF0EA5E9); // Sky Blue (#0EA5E9)
  static const Color skyBlue = Color(0xFF0EA5E9);
  static const Color medicalBlue = Color(0xFF0EA5E9); // Kept for backwards compatibility
  static const Color teal = Color(0xFF06B6D4);
  static const Color deepNavy = Color(0xFF0F172A); // Slate 900

  // Background and Canvas Colors
  static const Color canvasColor = Color(0xFFF8FAFC); // Off-white canvas (#F8FAFC)
  static const Color white = Colors.white;
  static const Color black = Colors.black;
  static const Color transparent = Colors.transparent;

  // Text Colors (HMS Slate Scale)
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900 (#0F172A)
  static const Color textSecondary = Color(0xFF64748B); // Slate 500 (#64748B)

  // Status Colors (HMS Clinical Standards)
  static const Color error = Color(0xFFEF4444); // Critical (Rose #EF4444)
  static const Color success = Color(0xFF10B981); // Success (Emerald #10B981)
  static const Color warning = Color(0xFFF59E0B); // Warning (Amber #F59E0B)

  // Extended Palette (UC-03 Appointment Booking)
  static const Color purple = Color(0xFF7C3AED);        // Selected doctor / MoMo
  static const Color purpleSurface = Color(0xFFF5F3FF); // Purple card background
  static const Color slotSelected = Color(0xFF1D4ED8);  // Selected time slot
  static const Color borderLight = Color(0xFFE2E8F0);   // Light border
  static const Color textHint = Color(0xFF94A3B8);      // Hint / placeholder text
  static const Color surfaceLight = Color(0xFFF1F5F9);  // Disabled slot bg

  static const Color darkBlue = Color(0xFF0284C7);
  static const Color orange = Color(0xFFF97316);

  // --- NEW MISSING COLORS (From UI Audit) ---
  // Background / Tint Colors
  static const Color sky100 = Color(0xFFE0F2FE);
  static const Color sky200 = Color(0xFFBAE6FD);
  static const Color green100 = Color(0xFFDCFCE7);
  static const Color emerald100 = Color(0xFFD1FAE5);
  static const Color green50 = Color(0xFFF0FDF4);
  static const Color red100 = Color(0xFFFEE2E2);
  static const Color orange50 = Color(0xFFFFF7ED);
  static const Color amber50 = Color(0xFFFFFBEB);
  static const Color amber100 = Color(0xFFFEF3C7);
  static const Color yellow100 = Color(0xFFFEF9C3);
  static const Color blue200 = Color(0xFFBFDBFE);
  static const Color amber200 = Color(0xFFFDE68A);
  static const Color orange200 = Color(0xFFFED7AA);

  // Slate / Gray Colors
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate300Alt = Color(0xFFCBD5E0);
  static const Color blackAlpha10 = Color(0x0A000000);

  // Accent / Text Colors
  static const Color amber600 = Color(0xFFD97706);
  static const Color amber900 = Color(0xFF92400E);
  static const Color orange700 = Color(0xFFC2410C);
  static const Color orange800 = Color(0xFFEF6C00);
  static const Color teal600 = Color(0xFF0D9488);
  static const Color sky700 = Color(0xFF0369A1);
  static const Color green500 = Color(0xFF22C55E);
  static const Color green300 = Color(0xFF86EFAC);
  static const Color sky400 = Color(0xFF38BDF8);
  static const Color amber400 = Color(0xFFFBBF24);
  static const Color pink500 = Color(0xFFEC4899);
  // -------------------------------------------

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, darkBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient tealGradient = LinearGradient(
    colors: [primary, teal],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient warningGradient = LinearGradient(
    colors: [error, orange],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // UC-08: Daily Activities gradients
  static const LinearGradient successGradient = LinearGradient(
    colors: [success, teal600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient orangeGradient = LinearGradient(
    colors: [orange, amber600],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
