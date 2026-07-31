import 'package:flutter/material.dart';
import '../../core/app_colors.dart';

class AppointmentSuccessView extends StatelessWidget {
  final DateTime date;
  final String time;
  final String doctorName;

  const AppointmentSuccessView({
    super.key,
    required this.date,
    required this.time,
    required this.doctorName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF22C55E), width: 2),
                  color: const Color(0xFFDCFCE7),
                ),
                child: const Icon(Icons.check, color: Color(0xFF22C55E), size: 40),
              ),
              const SizedBox(height: 24),
              const Text(
                'Đặt lịch thành công!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Thông báo xác nhận đã được gửi đến số điện thoại và email đăng ký của bạn.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('TÓM TẮT LỊCH HẸN', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF94A3B8))),
                    const Divider(height: 32, color: Color(0xFFE2E8F0)),
                    _SummaryRow(
                      icon: Icons.calendar_today,
                      label: 'Ngày khám',
                      value: '${date.day}/${date.month}/${date.year}',
                    ),
                    const SizedBox(height: 16),
                    _SummaryRow(
                      icon: Icons.access_time,
                      label: 'Giờ khám',
                      value: time,
                    ),
                    const SizedBox(height: 16),
                    _SummaryRow(
                      icon: Icons.person_outline,
                      label: 'Bác sĩ',
                      value: doctorName,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Trở về trang chủ (hoặc tab lịch hẹn)
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0EA5E9),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  child: const Text('Về trang chủ', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _SummaryRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 20, color: const Color(0xFF0EA5E9)),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
      ],
    );
  }
}
