import 'package:flutter/material.dart';

/// HMS Design System Border Radius Tokens.
class AppRadius {
  AppRadius._();

  static const double button = 8.0;
  static const double input = 8.0;
  static const double card = 16.0;
  static const double chip = 20.0;
  static const double full = 999.0;

  // BorderRadius shortcuts
  static BorderRadius get buttonBorder => BorderRadius.circular(button);
  static BorderRadius get inputBorder => BorderRadius.circular(input);
  static BorderRadius get cardBorder => BorderRadius.circular(card);
  static BorderRadius get chipBorder => BorderRadius.circular(chip);
  static BorderRadius get fullBorder => BorderRadius.circular(full);
}
