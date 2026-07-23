import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../view_models/onboarding_viewmodel.dart';
import '../../core/app_colors.dart';

class OnboardingView extends StatelessWidget {
  const OnboardingView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => OnboardingViewModel(),
      child: const _OnboardingBody(),
    );
  }
}

class _OnboardingBody extends StatelessWidget {
  const _OnboardingBody();

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<OnboardingViewModel>();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: viewModel.pageController,
                onPageChanged: viewModel.onPageChanged,
                children: const [
                  _OnboardingPage(
                    icon: Icons.calendar_month_rounded,
                    title: 'Đặt lịch khám online nhanh chóng',
                    description: 'Dễ dàng đặt lịch khám bệnh trực tuyến mọi lúc, mọi nơi chỉ với vài thao tác cơ bản.',
                  ),
                  _OnboardingPage(
                    icon: Icons.health_and_safety_rounded,
                    title: 'Theo dõi sức khoẻ toàn diện',
                    description: 'Nhiều chức năng theo dõi sức khoẻ được tích hợp trong app giúp bạn làm chủ cơ thể của mình.',
                  ),
                  _OnboardingPage(
                    icon: Icons.biotech_rounded,
                    title: 'AI chẩn đoán hình ảnh',
                    description: 'Tích hợp AI chẩn đoán hình ảnh chính xác hỗ trợ theo dõi bệnh lý an toàn.',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SmoothPageIndicator(
                    controller: viewModel.pageController,
                    count: 3,
                    effect: ExpandingDotsEffect(
                      activeDotColor: AppColors.medicalBlue,
                      dotColor: AppColors.textSecondary.withValues(alpha: 0.3),
                      dotHeight: 8,
                      dotWidth: 8,
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => viewModel.nextPage(context),
                    style: ElevatedButton.styleFrom(
                      shape: const CircleBorder(),
                      padding: const EdgeInsets.all(16),
                    ),
                    child: Icon(
                      viewModel.currentPage == 2 ? Icons.check : Icons.arrow_forward_ios,
                      size: 24,
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

class _OnboardingPage extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _OnboardingPage({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 120,
            color: AppColors.teal,
          ),
          const SizedBox(height: 48),
          Text(
            title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: 16),
          Text(
            description,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
