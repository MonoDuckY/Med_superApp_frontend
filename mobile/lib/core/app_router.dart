import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../views/auth/login_view.dart';
import '../views/auth/otp_view.dart';
import '../views/home/home_view.dart';
import '../views/appointments_list/appointments_list_view.dart';
import '../views/appointment/appointment_booking_view.dart';
import '../views/feedback/feedback_view.dart';
import '../views/health/health_dashboard_view.dart';
import '../views/health/medicine_schedule_view.dart';
import '../views/health/daily_activities_view.dart';
import '../views/profile/profile_placeholder_view.dart';
import '../views/profile/medical_record_list_view.dart';
import '../views/profile/medical_record_detail_view.dart';
import '../views/profile/personal_info_view.dart';
import '../views/health/health_news_view.dart';
import '../views/notification/notification_list_view.dart';
import '../views/shared/main_shell.dart';
import '../view_models/medicine_schedule_viewmodel.dart';
import '../view_models/notification_viewmodel.dart';

class AppRouter {
  AppRouter._();

  static final router = GoRouter(
    initialLocation: '/home',
    redirect: (context, state) async {
      final prefs = await SharedPreferences.getInstance();
      final isLoggedIn = prefs.getBool('is_logged_in') ?? false;

      final path = state.uri.toString();
      final isGoingToLogin = path == '/login';
      final isGoingToOtp = path.startsWith('/otp');

      if (!isLoggedIn && !isGoingToLogin && !isGoingToOtp) {
        return '/login';
      }
      if (isLoggedIn && (isGoingToLogin || isGoingToOtp)) {
        return '/home';
      }
      return null;
    },
    routes: [
      // ── Auth routes (no Bottom Nav) ───────────────────────────────────────
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginView(),
      ),
      GoRoute(
        path: '/otp/:phoneNumber',
        builder: (context, state) {
          final phoneNumber = state.pathParameters['phoneNumber'] ?? '';
          return OtpView(phoneNumber: phoneNumber);
        },
      ),

      // ── Authenticated shell — Bottom Navigation 4 tabs ────────────────────
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          // Tab 1 — Trang chủ
          GoRoute(
            path: '/home',
            builder: (context, state) => const HomeView(),
          ),

          // Tab 2 — Lịch khám (UC-07)
          GoRoute(
            path: '/schedule',
            builder: (context, state) => const AppointmentsListView(),
          ),

          // Tab 3 — Sức khỏe (UC-09, UC-11, UC-14)
          GoRoute(
            path: '/health',
            builder: (context, state) => const HealthDashboardView(),
          ),

          // Tab 4 — Hồ sơ (UC-06)
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePlaceholderView(),
          ),
        ],
      ),

      // ── Full-screen flows (no Bottom Nav) ─────────────────────────────────

      // UC-07: Đặt lịch mới
      GoRoute(
        path: '/schedule/book',
        builder: (context, state) => const AppointmentBookingView(),
      ),

      // UC-13: Gửi phản hồi (phát sinh từ lịch khám đã hoàn thành)
      GoRoute(
        path: '/schedule/feedback',
        builder: (context, state) => const FeedbackView(),
      ),
      GoRoute(
        path: '/profile/feedback',
        builder: (context, state) => const FeedbackView(),
      ),

      // UC-06: Hồ sơ bệnh án — danh sách
      GoRoute(
        path: '/profile/medical-records',
        builder: (context, state) => const MedicalRecordListView(),
      ),

      // UC-04: Thông tin cá nhân
      GoRoute(
        path: '/profile/personal-info',
        builder: (context, state) => const PersonalInfoView(),
      ),

      // UC-06: Hồ sơ bệnh án — chi tiết
      GoRoute(
        path: '/profile/medical-records/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return MedicalRecordDetailView(recordId: id);
        },
      ),

      // UC-10: Lịch uống thuốc
      GoRoute(
        path: '/health/medicine-schedule',
        builder: (context, state) => ChangeNotifierProvider(
          create: (_) => MedicineScheduleViewModel(),
          child: const MedicineScheduleView(),
        ),
      ),

      // UC-08: Theo dõi hoạt động sức khỏe hàng ngày
      GoRoute(
        path: '/health/daily-activities',
        builder: (context, state) => const DailyActivitiesView(),
      ),

      // UC-12: Tin tức & Kiến thức sức khỏe
      GoRoute(
        path: '/health/news',
        builder: (context, state) => const HealthNewsListView(),
      ),
      GoRoute(
        path: '/health/news/:id',
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return HealthNewsDetailView(articleId: id);
        },
      ),

      // UC-09: Thông báo bệnh nhân
      GoRoute(
        path: '/notifications',
        builder: (context, state) => ChangeNotifierProvider(
          create: (_) => NotificationViewModel(),
          child: const NotificationListView(),
        ),
      ),
    ],
  );
}
