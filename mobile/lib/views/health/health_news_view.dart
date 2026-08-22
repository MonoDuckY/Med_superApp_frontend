import 'package:flutter/material.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/app_colors.dart';
import '../../core/utils/html_utils.dart';
import '../../models/dto/news_response.dart';
import '../../view_models/health_news_viewmodel.dart';

/// UC-12 — Màn hình Danh sách bài viết & Tin tức sức khỏe.
class HealthNewsListView extends StatelessWidget {
  const HealthNewsListView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HealthNewsViewModel()..loadNews(),
      child: const _HealthNewsListScaffold(),
    );
  }
}

class _HealthNewsListScaffold extends StatelessWidget {
  const _HealthNewsListScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<HealthNewsViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 18, color: AppColors.textPrimary),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/health');
            }
          },
        ),
        title: Text(
          'Kiến thức & Tin tức',
          style: GoogleFonts.inter(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // ── Category Filter Bar ───────────────────────────────────────────
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: vm.categories.map((cat) {
                  final isSelected = vm.selectedCategory == cat;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      label: Text(cat),
                      selected: isSelected,
                      onSelected: (_) => vm.setCategory(cat),
                      labelStyle: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: isSelected
                            ? FontWeight.w700
                            : FontWeight.w500,
                        color: isSelected
                            ? Colors.white
                            : AppColors.textPrimary,
                      ),
                      backgroundColor: AppColors.surfaceLight,
                      selectedColor: AppColors.primary,
                      showCheckmark: false,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                        side: BorderSide(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.borderLight,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderLight),

          // ── Article List Content ──────────────────────────────────────────
          Expanded(
            child: RefreshIndicator(
              onRefresh: () => vm.loadNews(refresh: true),
              color: AppColors.primary,
              child: _buildListBody(context, vm),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListBody(BuildContext context, HealthNewsViewModel vm) {
    if (vm.isLoading && vm.articles.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (vm.errorMessage != null && vm.articles.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.textHint),
              const SizedBox(height: 12),
              Text(
                vm.errorMessage!,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => vm.loadNews(refresh: true),
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

    final filtered = vm.filteredArticles;

    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.article_outlined, size: 48, color: AppColors.textHint),
            const SizedBox(height: 12),
            Text(
              'Không có bài viết nào trong chuyên mục này',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      physics: const AlwaysScrollableScrollPhysics(
          parent: BouncingScrollPhysics()),
      itemCount: filtered.length,
      separatorBuilder: (context, index) => const SizedBox(height: 14),
      itemBuilder: (context, index) {
        final article = filtered[index];
        return _ArticleItemCard(article: article);
      },
    );
  }
}

// ── Article Item Card ─────────────────────────────────────────────────────────

class _ArticleItemCard extends StatelessWidget {
  final NewsResponseDto article;
  const _ArticleItemCard({required this.article});

  Color get _categoryColor {
    switch (article.category) {
      case 'Tim mạch':
        return AppColors.error;
      case 'Dinh dưỡng':
        return AppColors.success;
      case 'Phòng bệnh':
        return AppColors.teal;
      case 'Lối sống':
        return AppColors.purple;
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    final hasCover = article.coverPhoto != null &&
        article.coverPhoto!.url.isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => context.push('/health/news/${article.newsId}'),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Optional cover photo banner
                if (hasCover) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(
                        article.coverPhoto!.url,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, progress) {
                          if (progress == null) return child;
                          return Container(
                            color: AppColors.surfaceLight,
                            child: const Center(
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            ),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) =>
                            Container(
                          color: AppColors.surfaceLight,
                          child: const Icon(
                            Icons.broken_image_rounded,
                            color: AppColors.textHint,
                            size: 32,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Category + Read Time + Date
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _categoryColor.withAlpha(15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        article.category,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: _categoryColor,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.access_time_rounded,
                        size: 12, color: AppColors.textHint),
                    const SizedBox(width: 4),
                    Text(
                      article.estimatedReadTime,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      article.formattedPublishedDate,
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: AppColors.textHint,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Title
                Text(
                  article.title,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 6),

                // Summary
                Text(
                  HtmlUtils.stripHtml(article.summary),
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    height: 1.45,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 10),

                // Author + Read More link
                Row(
                  children: [
                    const Icon(Icons.verified_user_outlined,
                        size: 13, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        article.displayAuthor,
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Spacer(),
                    Row(
                      children: [
                        Text(
                          'Đọc tiếp',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          size: 13,
                          color: AppColors.primary,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── UC-12 Detail View ─────────────────────────────────────────────────────────

class HealthNewsDetailView extends StatelessWidget {
  final String articleId;
  const HealthNewsDetailView({super.key, required this.articleId});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => HealthNewsViewModel()..loadDetail(articleId),
      child: _HealthNewsDetailScaffold(articleId: articleId),
    );
  }
}

class _HealthNewsDetailScaffold extends StatelessWidget {
  final String articleId;
  const _HealthNewsDetailScaffold({required this.articleId});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<HealthNewsViewModel>();

    if (vm.isDetailLoading && vm.selectedArticle == null) {
      return const Scaffold(
        backgroundColor: AppColors.canvasColor,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    final article = vm.selectedArticle;
    if (article == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Bài viết'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Text(
            vm.detailErrorMessage ?? 'Không tìm thấy bài viết',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.textSecondary),
          ),
        ),
      );
    }

    final dateStr = article.formattedPublishedDate;
    final hasCover = article.coverPhoto != null &&
        article.coverPhoto!.url.isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 1,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 18, color: AppColors.textPrimary),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/health/news');
            }
          },
        ),
        title: Text(
          article.category,
          style: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 36),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              article.title,
              style: GoogleFonts.inter(
                fontSize: 21,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
                height: 1.3,
              ),
            ),
            const SizedBox(height: 14),

            // Author & Meta Info Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.canvasColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 16,
                    backgroundColor: AppColors.primary,
                    child: Icon(Icons.person, size: 18, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          article.displayAuthor,
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$dateStr  •  ${article.estimatedReadTime}',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Cover Image
            if (hasCover) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Image.network(
                  article.coverPhoto!.url,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Summary quote box
            if (article.summary.trim().isNotEmpty) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.sky100.withAlpha(70),
                  borderRadius: BorderRadius.circular(12),
                  border: const Border(
                    left: BorderSide(color: AppColors.primary, width: 4),
                  ),
                ),
                child: HtmlUtils.isHtml(article.summary)
                    ? HtmlWidget(
                        article.summary,
                        textStyle: GoogleFonts.inter(
                          fontSize: 13,
                          fontStyle: FontStyle.italic,
                          height: 1.5,
                          color: AppColors.textPrimary,
                        ),
                        customStylesBuilder: (element) {
                          if (element.localName == 'p') {
                            return {'margin': '0 0 6px 0'};
                          }
                          return null;
                        },
                      )
                    : Text(
                        article.summary,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          fontStyle: FontStyle.italic,
                          height: 1.45,
                          color: AppColors.textPrimary,
                        ),
                      ),
              ),
              const SizedBox(height: 20),
            ],

            // Body content
            HtmlWidget(
              article.content,
              textStyle: GoogleFonts.inter(
                fontSize: 15,
                height: 1.65,
                color: AppColors.textPrimary,
              ),
              customStylesBuilder: (element) {
                switch (element.localName) {
                  case 'a':
                    return {
                      'color': '#0284C7',
                      'text-decoration': 'none',
                      'font-weight': '600',
                    };
                  case 'p':
                    return {
                      'margin-bottom': '12px',
                      'line-height': '1.65',
                    };
                  case 'h1':
                    return {
                      'font-size': '20px',
                      'font-weight': '700',
                      'margin-top': '18px',
                      'margin-bottom': '8px',
                      'color': '#0F172A',
                    };
                  case 'h2':
                    return {
                      'font-size': '18px',
                      'font-weight': '700',
                      'margin-top': '16px',
                      'margin-bottom': '8px',
                      'color': '#0F172A',
                    };
                  case 'h3':
                    return {
                      'font-size': '16px',
                      'font-weight': '600',
                      'margin-top': '14px',
                      'margin-bottom': '6px',
                      'color': '#0F172A',
                    };
                  case 'blockquote':
                    return {
                      'border-left': '4px solid #0284C7',
                      'padding-left': '12px',
                      'font-style': 'italic',
                      'color': '#475569',
                      'margin': '12px 0',
                    };
                  case 'ul':
                  case 'ol':
                    return {
                      'padding-left': '20px',
                      'margin-bottom': '12px',
                    };
                  case 'li':
                    return {
                      'margin-bottom': '6px',
                    };
                  default:
                    return null;
                }
              },
              onTapUrl: (url) async {
                final uri = Uri.tryParse(url);
                if (uri != null && await canLaunchUrl(uri)) {
                  await launchUrl(uri, mode: LaunchMode.externalApplication);
                  return true;
                }
                return false;
              },
            ),
            const SizedBox(height: 24),

            // Disclaimer
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.amber50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.amber200),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline_rounded,
                      size: 16, color: AppColors.amber600),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Lưu ý: Thông tin bài viết chỉ mang tính chất tham khảo. Vui lòng tham vấn ý kiến bác sĩ chuyên khoa trước khi áp dụng bất kỳ phác đồ dinh dưỡng hay điều trị nào.',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        height: 1.45,
                        color: AppColors.amber900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
