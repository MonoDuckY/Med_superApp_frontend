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
      create: (_) => FeedbackViewModel()..init(),
      child: const _FeedbackScaffold(),
    );
  }
}

// ── Scaffold with Tabs ────────────────────────────────────────────────────────

class _FeedbackScaffold extends StatefulWidget {
  const _FeedbackScaffold();

  @override
  State<_FeedbackScaffold> createState() => _FeedbackScaffoldState();
}

class _FeedbackScaffoldState extends State<_FeedbackScaffold>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      body: SafeArea(
        child: Column(
          children: [
            _FeedbackHeader(tabController: _tabController),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _FeedbackFormTab(),
                  _FeedbackHistoryTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header & Tab Bar ──────────────────────────────────────────────────────────

class _FeedbackHeader extends StatelessWidget {
  final TabController tabController;

  const _FeedbackHeader({required this.tabController});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 12, 20, 10),
            child: Row(
              children: [
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
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Góp ý & Đánh giá dịch vụ',
                        style: GoogleFonts.inter(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'Ý kiến của bạn giúp nâng cao chất lượng phục vụ',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Tab selection bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Container(
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: tabController,
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                indicator: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(10),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: GoogleFonts.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                tabs: const [
                  Tab(
                    iconMargin: EdgeInsets.zero,
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.edit_note_rounded, size: 18),
                          SizedBox(width: 4),
                          Text('Gửi góp ý'),
                        ],
                      ),
                    ),
                  ),
                  Tab(
                    iconMargin: EdgeInsets.zero,
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.history_rounded, size: 18),
                          SizedBox(width: 4),
                          Text('Lịch sử phản hồi'),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          const Divider(height: 1, color: AppColors.borderLight),
        ],
      ),
    );
  }
}

// ── Tab 1: Form gửi phản hồi ──────────────────────────────────────────────────

class _FeedbackFormTab extends StatelessWidget {
  const _FeedbackFormTab();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                _ServiceDropdown(),
                SizedBox(height: 20),
                _StarRatingSection(),
                SizedBox(height: 20),
                _HighlightsSection(),
                SizedBox(height: 20),
                _CommentSection(),
                SizedBox(height: 16),
                _WarningNote(),
                SizedBox(height: 8),
              ],
            ),
          ),
        ),
        const _SubmitSection(),
      ],
    );
  }
}

// ── Section: Service Dropdown ─────────────────────────────────────────────────

class _ServiceDropdown extends StatelessWidget {
  const _ServiceDropdown();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionLabel(
          label: 'Chọn dịch vụ / phương diện đánh giá',
          required: true,
        ),
        const SizedBox(height: 8),
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
          child: vm.isLoadingServices
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
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  child: DropdownButton<HospitalServiceOption>(
                    value: vm.selectedService,
                    isExpanded: true,
                    underline: const SizedBox.shrink(),
                    hint: Text(
                      'Chọn dịch vụ cần góp ý...',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.textHint,
                      ),
                    ),
                    icon: const Icon(
                      Icons.keyboard_arrow_down_rounded,
                      color: AppColors.textSecondary,
                    ),
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.textPrimary,
                    ),
                    items: vm.serviceOptions.map((service) {
                      return DropdownMenuItem(
                        value: service,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              service.label,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              service.description,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: AppColors.textSecondary,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: vm.selectService,
                  ),
                ),
        ),
      ],
    );
  }
}

// ── Section: Star Rating ──────────────────────────────────────────────────────

class _StarRatingSection extends StatelessWidget {
  const _StarRatingSection();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const _SectionLabel(label: 'Mức độ hài lòng của bạn', required: true),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
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
              // Stars
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
                          size: 42,
                          color: isFilled ? AppColors.warning : AppColors.slate300,
                        ),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 10),

              // Rating label badge
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Container(
                  key: ValueKey(vm.starRating),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
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

              const SizedBox(height: 8),

              // Labels
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '1★ Rất tệ',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.textHint),
                  ),
                  Text(
                    '5★ Xuất sắc',
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.textHint),
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
  const _HighlightsSection();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Flexible(
              child: Text(
                'Điểm nổi bật',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '(Tùy chọn)',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textHint),
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
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary.withAlpha(15) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? AppColors.primary : AppColors.borderLight,
                    width: isSelected ? 1.5 : 1.0,
                  ),
                ),
                child: Text(
                  highlight.label,
                  style: GoogleFonts.inter(
                    fontSize: 12.5,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
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
  const _CommentSection();

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
            Flexible(
              child: Text(
                'Ý kiến đóng góp chi tiết',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 6),
            Text(
              '(Tùy chọn)',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.textHint),
            ),
          ],
        ),
        const SizedBox(height: 8),
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
            maxLines: 4,
            onChanged: vm.updateComment,
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: 'Chia sẻ trải nghiệm cụ thể để chúng tôi phục vụ tốt hơn...',
              hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.textHint),
              contentPadding: const EdgeInsets.all(14),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              counterStyle: GoogleFonts.inter(fontSize: 11, color: AppColors.textHint),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Warning Note ──────────────────────────────────────────────────────────────

class _WarningNote extends StatelessWidget {
  const _WarningNote();

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
            child: Text(
              'Ý kiến phản hồi sẽ được gửi trực tiếp đến ban quản lý bệnh viện để tiếp nhận và phản hồi sớm nhất.',
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppColors.amber900,
                height: 1.4,
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
  const _SubmitSection();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    // Hiển thị dialog thành công khi gửi xong
    if (vm.submitSuccess) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          vm.clearSuccessFlag();
          _showSuccessDialog(context);
        }
      });
    }

    // Hiển thị snackbar nếu có lỗi
    if (vm.errorMessage != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(vm.errorMessage!),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      });
    }

    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 48,
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
                style: GoogleFonts.inter(fontSize: 15, fontWeight: FontWeight.w600),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    vm.canSubmit ? AppColors.primary : AppColors.surfaceLight,
                foregroundColor: vm.canSubmit ? Colors.white : AppColors.textHint,
                elevation: vm.canSubmit ? 2 : 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                disabledBackgroundColor: AppColors.surfaceLight,
                disabledForegroundColor: AppColors.textHint,
              ),
            ),
          ),
          if (!vm.canSubmit) ...[
            const SizedBox(height: 6),
            Text(
              'Vui lòng chọn dịch vụ và đánh giá số sao để gửi',
              style: GoogleFonts.inter(fontSize: 11, color: AppColors.textHint),
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
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.success.withAlpha(20),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  size: 38,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 14),
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
                'Cảm ơn bạn đã đóng góp ý kiến. Bạn có thể theo dõi phản hồi từ nhân viên y tế trong tab "Lịch sử phản hồi".',
                style: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.of(ctx).pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: Text(
                    'Đã hiểu',
                    style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
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

// ── Tab 2: Lịch sử phản hồi ───────────────────────────────────────────────────

class _FeedbackHistoryTab extends StatelessWidget {
  const _FeedbackHistoryTab();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<FeedbackViewModel>();

    if (vm.isLoadingHistory) {
      return const Center(
        child: CircularProgressIndicator(strokeWidth: 2.5),
      );
    }

    if (vm.historyErrorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                vm.historyErrorMessage!,
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: vm.loadMyFeedbacks,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (vm.myFeedbacks.isEmpty) {
      return RefreshIndicator(
        onRefresh: vm.loadMyFeedbacks,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(32),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 60),
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.rate_review_outlined,
                    size: 36,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Chưa có phản hồi nào',
                  style: GoogleFonts.inter(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Mọi ý kiến đóng góp của bạn sau khi gửi sẽ được lưu và hiển thị tại đây.',
                  style: GoogleFonts.inter(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: vm.loadMyFeedbacks,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        itemCount: vm.myFeedbacks.length,
        separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final item = vm.myFeedbacks[index];
          return _FeedbackItemCard(item: item);
        },
      ),
    );
  }
}

// ── Card lịch sử phản hồi ─────────────────────────────────────────────────────

class _FeedbackItemCard extends StatelessWidget {
  final FeedbackItem item;

  const _FeedbackItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final isResponded = item.isResponded;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isResponded ? AppColors.emerald100 : AppColors.borderLight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Dịch vụ & Badge trạng thái
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  item.serviceType.isNotEmpty
                      ? item.serviceType
                      : 'Dịch vụ bệnh viện',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isResponded
                      ? AppColors.success.withAlpha(20)
                      : AppColors.warning.withAlpha(20),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isResponded
                          ? Icons.check_circle_rounded
                          : Icons.access_time_rounded,
                      size: 12,
                      color: isResponded ? AppColors.success : AppColors.warning,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      item.statusLabel,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isResponded ? AppColors.success : AppColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Rating Stars
          Row(
            children: [
              Row(
                children: List.generate(5, (i) {
                  return Icon(
                    i < item.rating
                        ? Icons.star_rounded
                        : Icons.star_outline_rounded,
                    size: 18,
                    color: i < item.rating
                        ? AppColors.warning
                        : AppColors.slate300,
                  );
                }),
              ),
              const SizedBox(width: 8),
              Text(
                '${item.rating}/5 sao',
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),

          if (item.content.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              item.content,
              style: GoogleFonts.inter(
                fontSize: 13,
                color: AppColors.textPrimary,
                height: 1.4,
              ),
            ),
          ],

          // Khung phản hồi từ nhân viên / bệnh viện
          if (isResponded && item.response != null && item.response!.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.sky100.withAlpha(40),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.sky200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.support_agent_rounded,
                        size: 16,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Phản hồi từ Bệnh viện',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.response!,
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      color: AppColors.textPrimary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
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
        Flexible(
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
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

