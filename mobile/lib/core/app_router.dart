import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../views/auth/login_view.dart';
import '../views/auth/otp_view.dart';
import '../views/home/home_view.dart';

class AppRouter {
  AppRouter._();

  static final router = GoRouter(
    initialLocation: '/login',
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
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeView(),
      ),
    ],
  );
}
