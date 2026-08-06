import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';

/// Blue summary pill that persists across all 3 booking steps.
/// Shows selected date, time, and (optionally) selected doctor.
class BookingSummaryBar extends StatelessWidget {
  final String date;
  final String time;
  final String? doctorName;

  const BookingSummaryBar({
    super.key,
    required this.date,
    required this.time,
    this.doctorName,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFBFDBFE)),
      ),
      child: Row(
        children: [
          const Icon(Icons.calendar_today_outlined,
              size: 15, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            date,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(width: 14),
          const Icon(Icons.access_time, size: 15, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            time,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
          if (doctorName != null && doctorName!.isNotEmpty) ...[
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                doctorName!,
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
