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

  // Text Colors (HMS Slate Scale)
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900 (#0F172A)
  static const Color textSecondary = Color(0xFF64748B); // Slate 500 (#64748B)

  // Status Colors (HMS Clinical Standards)
  static const Color error = Color(0xFFEF4444); // Critical (Rose #EF4444)
  static const Color success = Color(0xFF10B981); // Success (Emerald #10B981)
  static const Color warning = Color(0xFFF59E0B); // Warning (Amber #F59E0B)
}
