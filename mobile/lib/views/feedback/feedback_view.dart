import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../models/feedback_model.dart';
import '../../view_models/feedback_viewmodel.dart';

// ── Entry point ───────────────────────────────────────────────────────────────

class FeedbackView extends StatelessWidget {
  const FeedbackView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => FeedbackViewModel()..loadCompletedAppointments(),
      child: const _FeedbackScaffold(),
    );
  }
}

// ── Scaffold ──────────────────────────────────────────────────────────────────

class _FeedbackScaffold extends StatelessWidget {
  const _FeedbackScaffold();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Column(
          children: [
            _FeedbackHeader(),
            Expanded(
              child: _FeedbackBody(),
            ),
            _SubmitSection(),
          ],
        ),
      ),
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _FeedbackHeader extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 12, 20, 14),
            child: Row(
              children: [
                // Back button
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
                  color: AppColors.textPrimary,
                  onPressed: () => Navigator.of(context).maybePop(),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.surfaceLight,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Góp ý & Phản hồi',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),

                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),
        ],
      ),
    );
  }
}

// ── Scrollable Body ───────────────────────────────────────────────────────────

class _FeedbackBody extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _AppointmentDropdown(),
          const SizedBox(height: 24),
          _StarRatingSection(),
          const SizedBox(height: 24),
          _HighlightsSection(),
          const SizedBox(height: 24),
          _CommentSection(),
          const SizedBox(height: 16),
          _WarningNote(),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

// ── Section: Appointment Dropdown ─────────────────────────────────────────────

class _AppointmentDropdown extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(
          label: 'Chọn dịch vụ / ca khám',
          required: true,
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(6),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: vm.isLoadingAppointments
              ? const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(
                    child: SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 4),
                  child: DropdownButton<CompletedAppointmentOption>(
                    value: vm.selectedAppointment,
                    isExpanded: true,
                    underline: const SizedBox.shrink(),
                    hint: Text(
                      'Chọn dịch vụ hoặc ca khám đã hoàn thành...',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.textHint,
                      ),
                    ),
                    icon: const Icon(Icons.keyboard_arrow_down_rounded,
                        color: AppColors.textSecondary),
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.textPrimary,
                    ),
                    items: vm.appointmentOptions.map((option) {
                      return DropdownMenuItem(
                        value: option,
                        child: Text(
                          option.displayLabel,
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            color: AppColors.textPrimary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    }).toList(),
                    onChanged: vm.selectAppointment,
                  ),
                ),
        ),
      ],
    );
  }
}

// ── Section: Star Rating ──────────────────────────────────────────────────────

class _StarRatingSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionLabel(label: 'Đánh giá chất lượng dịch vụ', required: true),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(6),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Star row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starIndex = index + 1;
                  final isFilled = starIndex <= vm.starRating;
                  return GestureDetector(
                    onTap: () => vm.selectStar(starIndex),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 6),
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        transitionBuilder: (child, animation) =>
                            ScaleTransition(scale: animation, child: child),
                        child: Icon(
                          isFilled ? Icons.star_rounded : Icons.star_outline_rounded,
                          key: ValueKey('star_${starIndex}_$isFilled'),
                          size: 40,
                          color: isFilled
                              ? AppColors.warning
                              : AppColors.slate300,
                        ),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 12),

              // Rating label badge
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Container(
                  key: ValueKey(vm.starRating),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 5),
                  decoration: BoxDecoration(
                    color: vm.starRating == 0
                        ? AppColors.surfaceLight
                        : _starBadgeColor(vm.starRating).withAlpha(20),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    vm.starLabel,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: vm.starRating == 0
                          ? AppColors.textHint
                          : _starBadgeColor(vm.starRating),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 10),

              // Min/Max label row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Rất tệ',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.textHint,
                    ),
                  ),
                  Text(
                    'Xuất sắc',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Color _starBadgeColor(int rating) {
    switch (rating) {
      case 1:
        return AppColors.error;
      case 2:
        return AppColors.orange800;
      case 3:
        return AppColors.warning;
      case 4:
        return const Color(0xFF16A34A);
      case 5:
        return AppColors.success;
      default:
        return AppColors.textHint;
    }
  }
}

// ── Section: Highlight Chips ──────────────────────────────────────────────────

class _HighlightsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Điểm nổi bật',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '(Tùy chọn)',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textHint,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: FeedbackHighlight.values.map((highlight) {
            final isSelected = vm.selectedHighlights.contains(highlight);
            return GestureDetector(
              onTap: () => vm.toggleHighlight(highlight),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary.withAlpha(15)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.borderLight,
                    width: isSelected ? 1.5 : 1.0,
                  ),
                ),
                child: Text(
                  highlight.label,
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    fontWeight: isSelected
                        ? FontWeight.w600
                        : FontWeight.w400,
                    color: isSelected
                        ? AppColors.primary
                        : AppColors.textPrimary,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ── Section: Comment Textarea ─────────────────────────────────────────────────

class _CommentSection extends StatefulWidget {
  @override
  State<_CommentSection> createState() => _CommentSectionState();
}

class _CommentSectionState extends State<_CommentSection> {
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    // Sync controller if draft was cleared (after submit)
    if (_controller.text.isNotEmpty && vm.comment.isEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _controller.clear();
      });
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Ý kiến đóng góp',
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '(Tùy chọn)',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.textHint,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.borderLight),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(6),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextField(
            controller: _controller,
            maxLength: 500,
            maxLines: 5,
            onChanged: vm.updateComment,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              hintText:
                  'Chia sẻ trải nghiệm của bạn để chúng tôi phục vụ tốt hơn...',
              hintStyle: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textHint,
              ),
              contentPadding: const EdgeInsets.all(16),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              counterStyle: GoogleFonts.inter(
                fontSize: 11,
                color: AppColors.textHint,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Warning Note ──────────────────────────────────────────────────────────────

class _WarningNote extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.amber50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.amber200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.info_outline_rounded,
            size: 16,
            color: AppColors.amber600,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.inter(
                    fontSize: 12, color: AppColors.textPrimary),
                children: [
                  TextSpan(
                    text: 'Lưu ý: ',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.amber600,
                    ),
                  ),
                  const TextSpan(
                    text:
                        'Phản hồi không thể chỉnh sửa sau khi gửi. Mỗi dịch vụ chỉ được đánh giá một lần.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Submit Section (pinned bottom) ────────────────────────────────────────────

class _SubmitSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    // Show success dialog once
    if (vm.submitSuccess) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          vm.clearSuccessFlag();
          _showSuccessDialog(context);
        }
      });
    }

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              child: ElevatedButton.icon(
                onPressed: vm.canSubmit ? vm.submit : null,
                icon: vm.isSubmitting
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_rounded, size: 18),
                label: Text(
                  'Gửi phản hồi',
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: vm.canSubmit
                      ? AppColors.primary
                      : AppColors.surfaceLight,
                  foregroundColor:
                      vm.canSubmit ? Colors.white : AppColors.textHint,
                  elevation: vm.canSubmit ? 2 : 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  disabledBackgroundColor: AppColors.surfaceLight,
                  disabledForegroundColor: AppColors.textHint,
                ),
              ),
            ),
          ),
          if (!vm.canSubmit) ...[
            const SizedBox(height: 6),
            Text(
              'Vui lòng chọn dịch vụ và đánh giá sao để tiếp tục',
              style: GoogleFonts.inter(
                fontSize: 11,
                color: AppColors.textHint,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  void _showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Success icon
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  size: 40,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Gửi phản hồi thành công!',
                style: GoogleFonts.inter(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Cảm ơn bạn đã chia sẻ trải nghiệm. Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Đã hiểu',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Shared Label Widget ───────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String label;
  final bool required;

  const _SectionLabel({required this.label, this.required = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        if (required) ...[
          const SizedBox(width: 4),
          const Text(
            '*',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.error,
            ),
          ),
        ],
      ],
    );
  }
}
