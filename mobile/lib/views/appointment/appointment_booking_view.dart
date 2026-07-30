import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/app_colors.dart';
import '../../view_models/appointment_viewmodel.dart';
import 'step1_time_selection_view.dart';
import 'step2_doctor_selection_view.dart';
import 'step3_payment_view.dart';

/// Shell screen for the 3-step booking flow.
/// Provides [AppointmentViewModel] and switches content based on step.
class AppointmentBookingView extends StatelessWidget {
  const AppointmentBookingView({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) {
        final vm = AppointmentViewModel();
        // Pre-select today so time slots load immediately on open
        vm.selectDate(DateTime.now());
        return vm;
      },
      child: const _BookingScaffold(),
    );
  }
}

class _BookingScaffold extends StatelessWidget {
  const _BookingScaffold();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<AppointmentViewModel>();

    return Scaffold(
      backgroundColor: AppColors.canvasColor,
      appBar: _BookingAppBar(vm: vm),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        transitionBuilder: (child, animation) => FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.05, 0),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        ),
        child: _stepContent(vm.currentStep),
      ),
    );
  }

  Widget _stepContent(int step) {
    switch (step) {
      case 2:
        return const Step2DoctorSelectionView(key: ValueKey(2));
      case 3:
        return const Step3PaymentView(key: ValueKey(3));
      default:
        return const Step1TimeSelectionView(key: ValueKey(1));
    }
  }
}

class _BookingAppBar extends StatelessWidget implements PreferredSizeWidget {
  final AppointmentViewModel vm;

  const _BookingAppBar({required this.vm});

  @override
  Size get preferredSize => const Size.fromHeight(72);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: SafeArea(
        bottom: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  // Back button
                  GestureDetector(
                    onTap: () {
                      final handledInternally = vm.goBack();
                      if (!handledInternally) {
                        Navigator.of(context).pop();
                      }
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.canvasColor,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.borderLight),
                      ),
                      child: const Icon(Icons.arrow_back_ios_new,
                          size: 16, color: AppColors.textPrimary),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Đặt lịch khám',
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'UC-03 · Chọn thời gian trước',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
          ],
        ),
      ),
    );
  }
}
