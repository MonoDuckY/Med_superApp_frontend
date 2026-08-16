import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';

/// UC-08 — Bottom Sheet thêm bài tập mới.
class AddWorkoutBottomSheet extends StatefulWidget {
  final Function({
    required String workoutName,
    required DateTime scheduledAt,
    String? content,
    String? note,
  }) onSubmit;

  /// Ngày mà bài tập thuộc về.
  final DateTime forDate;

  const AddWorkoutBottomSheet({
    super.key,
    required this.onSubmit,
    required this.forDate,
  });

  @override
  State<AddWorkoutBottomSheet> createState() => _AddWorkoutBottomSheetState();
}

class _AddWorkoutBottomSheetState extends State<AddWorkoutBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _contentController = TextEditingController();
  final _noteController = TextEditingController();

  TimeOfDay _selectedTime = TimeOfDay.now();
  bool _isSubmitting = false;

  static const _workoutPresets = [
    'Đi bộ',
    'Chạy bộ',
    'Yoga',
    'Đạp xe',
    'Bơi lội',
    'Gym',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _contentController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.80,
      maxChildSize: 0.92,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Handle bar
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.slate300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 4),

              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 8, 8),
                child: Row(
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        gradient: AppColors.orangeGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.fitness_center_rounded,
                          color: AppColors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Thêm bài tập',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: const Icon(Icons.close_rounded),
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.borderLight),

              // Form content
              Expanded(
                child: SingleChildScrollView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Workout name presets
                        _SectionLabel(label: 'Loại bài tập'),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _workoutPresets
                              .map((preset) => _PresetChip(
                                    label: preset,
                                    isSelected:
                                        _nameController.text == preset,
                                    onTap: () => setState(
                                        () => _nameController.text = preset),
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _nameController,
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AppColors.textPrimary),
                          decoration: _inputDecoration(
                            hint: 'Hoặc nhập tên tuỳ chỉnh...',
                            icon: Icons.edit_rounded,
                            accentColor: AppColors.orange,
                          ),
                          validator: (v) =>
                              v == null || v.trim().isEmpty
                                  ? 'Vui lòng nhập tên bài tập'
                                  : null,
                          onChanged: (_) => setState(() {}),
                        ),

                        const SizedBox(height: 20),

                        // Time picker
                        _SectionLabel(label: 'Giờ bắt đầu'),
                        const SizedBox(height: 8),
                        _TimePicker(
                          selectedTime: _selectedTime,
                          onTap: _pickTime,
                          accentColor: AppColors.orange,
                        ),

                        const SizedBox(height: 20),

                        // Content / description
                        _SectionLabel(label: 'Mô tả nội dung (tuỳ chọn)'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _contentController,
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AppColors.textPrimary),
                          maxLines: 3,
                          maxLength: 2000,
                          decoration: _inputDecoration(
                            hint:
                                'Vd: Chạy 30 phút tốc độ nhẹ, nghỉ giữa chừng 5 phút...',
                            icon: Icons.description_outlined,
                            accentColor: AppColors.orange,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Note
                        _SectionLabel(label: 'Ghi chú (tuỳ chọn)'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _noteController,
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AppColors.textPrimary),
                          maxLines: 2,
                          decoration: _inputDecoration(
                            hint: 'Cảm nhận, nhắc nhở cá nhân...',
                            icon: Icons.sticky_note_2_outlined,
                            accentColor: AppColors.orange,
                          ),
                        ),

                        const SizedBox(height: 28),
                      ],
                    ),
                  ),
                ),
              ),

              // Submit button
              Padding(
                padding: EdgeInsets.fromLTRB(
                    20, 12, 20, MediaQuery.of(context).padding.bottom + 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.orange,
                      foregroundColor: AppColors.white,
                      disabledBackgroundColor:
                          AppColors.orange.withAlpha(100),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                      textStyle: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    child: _isSubmitting
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                                strokeWidth: 2.5, color: AppColors.white),
                          )
                        : const Text('Lưu bài tập'),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final now = widget.forDate;
    final scheduledAt = DateTime(
      now.year, now.month, now.day,
      _selectedTime.hour, _selectedTime.minute,
    );

    setState(() => _isSubmitting = true);

    await widget.onSubmit(
      workoutName: _nameController.text.trim(),
      scheduledAt: scheduledAt,
      content: _contentController.text.trim().isEmpty
          ? null
          : _contentController.text.trim(),
      note: _noteController.text.trim().isEmpty
          ? null
          : _noteController.text.trim(),
    );

    if (mounted) Navigator.of(context).pop();
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
    required Color accentColor,
  }) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(fontSize: 14, color: AppColors.textHint),
      prefixIcon: Icon(icon, size: 18, color: AppColors.textSecondary),
      filled: true,
      fillColor: AppColors.canvasColor,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: accentColor, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
    );
  }
}

// ── Shared Widgets ─────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;

  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: GoogleFonts.inter(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        color: AppColors.textSecondary,
        letterSpacing: 0.2,
      ),
    );
  }
}

class _PresetChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PresetChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.orange : AppColors.canvasColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.orange : AppColors.borderLight,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _TimePicker extends StatelessWidget {
  final TimeOfDay selectedTime;
  final VoidCallback onTap;
  final Color accentColor;

  const _TimePicker({
    required this.selectedTime,
    required this.onTap,
    required this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final h = selectedTime.hour.toString().padLeft(2, '0');
    final m = selectedTime.minute.toString().padLeft(2, '0');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.canvasColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Icon(Icons.access_time_rounded, size: 20, color: accentColor),
            const SizedBox(width: 12),
            Text(
              '$h:$m',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const Spacer(),
            Text(
              'Thay đổi',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: accentColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
