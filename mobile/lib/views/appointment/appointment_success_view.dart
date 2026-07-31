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
    // Add end time to summary just like the booking view
    String timeStr = time;
    if (timeStr.isNotEmpty && !timeStr.contains('-')) {
      try {
        final parts = timeStr.split(':');
        final dt = DateTime(2020, 1, 1, int.parse(parts[0]), int.parse(parts[1]));
        final endDt = dt.add(const Duration(minutes: 30));
        final endTimeStr = '${endDt.hour.toString().padLeft(2, '0')}:${endDt.minute.toString().padLeft(2, '0')}';
        timeStr = '$timeStr - $endTimeStr';
      } catch (_) {}
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 48.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF86EFAC), width: 1.5),
                  color: const Color(0xFFF0FDF4),
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
                'Thông báo xác nhận đã được gửi đến số điện thoại của bạn.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 32),
              
              // Summary Card (same style as booking view)
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.receipt_long, size: 16, color: Color(0xFF0EA5E9)),
                                  SizedBox(width: 8),
                                  Text('Tóm tắt lịch khám', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFDCFCE7),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: const Text('Chờ xác nhận', style: TextStyle(color: Color(0xFF16A34A), fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          _SummaryRow(
                            icon: Icons.calendar_today,
                            label: 'Ngày khám',
                            value: '${date.day}/${date.month}/${date.year}',
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.access_time,
                            label: 'Khung giờ',
                            value: timeStr,
                          ),
                          const SizedBox(height: 16),
                          _SummaryRow(
                            icon: Icons.person_outline,
                            label: 'Bác sĩ',
                            value: doctorName,
                          ),
                          const SizedBox(height: 16),
                          const _SummaryRow(
                            icon: Icons.business, 
                            label: 'Phòng khám', 
                            value: 'Phòng N3' // Hardcoded to match the screenshot
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFEF9C3), // Yellow background
                        borderRadius: BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.notifications_active_outlined, size: 14, color: Color(0xFFD97706)),
                          SizedBox(width: 8),
                          Expanded(child: Text('Thông báo sẽ được gửi qua SMS sau khi đặt lịch thành công.', style: TextStyle(fontSize: 11, color: Color(0xFFD97706)))),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Trở về trang chủ
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
        Icon(icon, size: 18, color: const Color(0xFF0EA5E9)),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14)),
        const Spacer(),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
      ],
    );
  }
}
