import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/app_colors.dart';

/// UC-08 — Bottom Sheet thêm bữa ăn mới.
///
/// Cho phép nhập: tên bữa, giờ ăn, danh sách món (ít nhất 1 món).
/// Mỗi món có: tên, khối lượng, đơn vị, calo (tuỳ chọn).
class AddMealBottomSheet extends StatefulWidget {
  final Function({
    required String mealName,
    required DateTime scheduledAt,
    required List<Map<String, dynamic>> dishes,
    String? note,
  }) onSubmit;

  /// Ngày mà bữa ăn thuộc về (để giới hạn time picker).
  final DateTime forDate;

  const AddMealBottomSheet({
    super.key,
    required this.onSubmit,
    required this.forDate,
  });

  @override
  State<AddMealBottomSheet> createState() => _AddMealBottomSheetState();
}

class _AddMealBottomSheetState extends State<AddMealBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _mealNameController = TextEditingController();
  final _noteController = TextEditingController();

  TimeOfDay _selectedTime = TimeOfDay.now();
  bool _isSubmitting = false;

  // Preset meal names
  static const _mealPresets = ['Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Bữa phụ'];

  // Dishes list (dynamic)
  final List<_DishFormData> _dishes = [_DishFormData()];

  @override
  void dispose() {
    _mealNameController.dispose();
    _noteController.dispose();
    for (final d in _dishes) {
      d.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.92,
      maxChildSize: 0.95,
      minChildSize: 0.6,
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
                        gradient: AppColors.successGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.restaurant_rounded,
                          color: AppColors.white, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Thêm bữa ăn',
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
                        // Meal name presets
                        _SectionLabel(label: 'Tên bữa ăn'),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _mealPresets
                              .map((preset) => _PresetChip(
                                    label: preset,
                                    isSelected:
                                        _mealNameController.text == preset,
                                    onTap: () => setState(
                                        () => _mealNameController.text = preset),
                                  ))
                              .toList(),
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: _mealNameController,
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AppColors.textPrimary),
                          decoration: _inputDecoration(
                            hint: 'Hoặc nhập tên tuỳ chỉnh...',
                            icon: Icons.edit_rounded,
                          ),
                          validator: (v) =>
                              v == null || v.trim().isEmpty
                                  ? 'Vui lòng nhập tên bữa ăn'
                                  : null,
                          onChanged: (_) => setState(() {}),
                        ),

                        const SizedBox(height: 20),

                        // Time picker
                        _SectionLabel(label: 'Giờ ăn'),
                        const SizedBox(height: 8),
                        _TimePicker(
                          selectedTime: _selectedTime,
                          onTap: _pickTime,
                          accentColor: AppColors.success,
                        ),

                        const SizedBox(height: 20),

                        // Dishes
                        Row(
                          children: [
                            _SectionLabel(label: 'Các món ăn'),
                            const Spacer(),
                            Text(
                              '${_dishes.length} món',
                              style: GoogleFonts.inter(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        ..._dishes.asMap().entries.map((entry) {
                          return _DishFormField(
                            key: ValueKey(entry.key),
                            data: entry.value,
                            index: entry.key,
                            canRemove: _dishes.length > 1,
                            onRemove: () =>
                                setState(() => _dishes.removeAt(entry.key)),
                          );
                        }),

                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: () =>
                              setState(() => _dishes.add(_DishFormData())),
                          icon: const Icon(Icons.add_circle_outline_rounded,
                              size: 18),
                          label: const Text('Thêm món'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.success,
                            textStyle: GoogleFonts.inter(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Note
                        _SectionLabel(label: 'Ghi chú (tuỳ chọn)'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _noteController,
                          style: GoogleFonts.inter(
                              fontSize: 14, color: AppColors.textPrimary),
                          maxLines: 2,
                          decoration: _inputDecoration(
                            hint: 'Ghi chú thêm...',
                            icon: Icons.sticky_note_2_outlined,
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
                      backgroundColor: AppColors.success,
                      foregroundColor: AppColors.white,
                      disabledBackgroundColor:
                          AppColors.success.withAlpha(100),
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
                        : const Text('Lưu bữa ăn'),
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
    for (final d in _dishes) {
      d.nameController.text = d.nameController.text.trim();
    }
    if (!_formKey.currentState!.validate()) return;

    final now = widget.forDate;
    final scheduledAt = DateTime(
      now.year, now.month, now.day,
      _selectedTime.hour, _selectedTime.minute,
    );

    final dishesPayload = _dishes.map((d) {
      return {
        'dishName': d.nameController.text.trim(),
        'quantity': double.tryParse(d.qtyController.text) ?? 1.0,
        'unit': d.unitController.text.trim().isEmpty
            ? 'g'
            : d.unitController.text.trim(),
        if (d.calController.text.isNotEmpty)
          'totalCalories': double.tryParse(d.calController.text),
        if (d.proteinController.text.isNotEmpty)
          'totalProtein': double.tryParse(d.proteinController.text),
        if (d.carbController.text.isNotEmpty)
          'totalCarbohydrates': double.tryParse(d.carbController.text),
        if (d.fatController.text.isNotEmpty)
          'totalFat': double.tryParse(d.fatController.text),
      };
    }).toList();

    setState(() => _isSubmitting = true);

    await widget.onSubmit(
      mealName: _mealNameController.text.trim(),
      scheduledAt: scheduledAt,
      dishes: dishesPayload,
      note: _noteController.text.trim().isEmpty
          ? null
          : _noteController.text.trim(),
    );

    if (mounted) Navigator.of(context).pop();
  }

  InputDecoration _inputDecoration({required String hint, required IconData icon}) {
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
        borderSide: const BorderSide(color: AppColors.success, width: 1.5),
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

// ── Dish Form Data ─────────────────────────────────────────────────────────────

class _DishFormData {
  final nameController = TextEditingController();
  final qtyController = TextEditingController(text: '100');
  final unitController = TextEditingController(text: 'g');
  final calController = TextEditingController();
  final proteinController = TextEditingController();
  final carbController = TextEditingController();
  final fatController = TextEditingController();

  void dispose() {
    nameController.dispose();
    qtyController.dispose();
    unitController.dispose();
    calController.dispose();
    proteinController.dispose();
    carbController.dispose();
    fatController.dispose();
  }
}

// ── Dish Form Field ────────────────────────────────────────────────────────────

class _DishFormField extends StatelessWidget {
  final _DishFormData data;
  final int index;
  final bool canRemove;
  final VoidCallback onRemove;

  const _DishFormField({
    super.key,
    required this.data,
    required this.index,
    required this.canRemove,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.green50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.success.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Center(
                  child: Text(
                    '${index + 1}',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Món ${index + 1}',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.teal600,
                ),
              ),
              const Spacer(),
              if (canRemove)
                InkWell(
                  onTap: onRemove,
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(Icons.remove_circle_outline_rounded,
                        size: 18, color: AppColors.error),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),

          // Dish name
          TextFormField(
            controller: data.nameController,
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.textPrimary),
            decoration: _fieldDecoration(hint: 'Tên món (vd: Cơm gà)'),
            validator: (v) =>
                v == null || v.trim().isEmpty ? 'Cần nhập tên món' : null,
          ),
          const SizedBox(height: 8),

          // Qty + Unit in a row
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextFormField(
                  controller: data.qtyController,
                  style: GoogleFonts.inter(
                      fontSize: 13, color: AppColors.textPrimary),
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                  ],
                  decoration: _fieldDecoration(hint: 'Lượng'),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Cần nhập';
                    if (double.tryParse(v) == null || double.parse(v) <= 0) {
                      return '> 0';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextFormField(
                  controller: data.unitController,
                  style: GoogleFonts.inter(
                      fontSize: 13, color: AppColors.textPrimary),
                  decoration: _fieldDecoration(hint: 'Đơn vị'),
                  validator: (v) =>
                      v == null || v.trim().isEmpty ? 'Cần nhập' : null,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Macro row (optional)
          Row(
            children: [
              Expanded(
                child: _MacroField(
                  controller: data.calController,
                  label: 'kcal',
                  hint: 'Calo',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _MacroField(
                  controller: data.proteinController,
                  label: 'g',
                  hint: 'Đạm',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _MacroField(
                  controller: data.carbController,
                  label: 'g',
                  hint: 'Tinh bột',
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: _MacroField(
                  controller: data.fatController,
                  label: 'g',
                  hint: 'Chất béo',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  InputDecoration _fieldDecoration({required String hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.textHint),
      filled: true,
      fillColor: AppColors.white,
      isDense: true,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.borderLight),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.success, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.error, width: 1.5),
      ),
      errorStyle: GoogleFonts.inter(fontSize: 10),
    );
  }
}

class _MacroField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String hint;

  const _MacroField({
    required this.controller,
    required this.label,
    required this.hint,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          hint,
          style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary),
        ),
        const SizedBox(height: 3),
        TextFormField(
          controller: controller,
          style:
              GoogleFonts.inter(fontSize: 12, color: AppColors.textPrimary),
          keyboardType:
              const TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
          ],
          decoration: InputDecoration(
            hintText: label,
            hintStyle:
                GoogleFonts.inter(fontSize: 11, color: AppColors.textHint),
            filled: true,
            fillColor: AppColors.white,
            isDense: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.borderLight),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.borderLight),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide:
                  const BorderSide(color: AppColors.success, width: 1.5),
            ),
          ),
        ),
      ],
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
          color: isSelected ? AppColors.success : AppColors.canvasColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.success : AppColors.borderLight,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? AppColors.white : AppColors.textSecondary,
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
