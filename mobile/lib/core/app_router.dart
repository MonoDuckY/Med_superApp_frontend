import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../views/onboarding/onboarding_view.dart';
import '../views/auth/login_view.dart';
import '../views/home/home_view.dart';

class AppRouter {
  AppRouter._();

  static final router = GoRouter(
    initialLocation: '/',
    redirect: (context, state) async {
      final prefs = await SharedPreferences.getInstance();
      final hasSeenOnboarding = prefs.getBool('has_seen_onboarding') ?? false;
      final isLoggedIn = prefs.getBool('is_logged_in') ?? false; // Mock login state

      final isGoingToOnboarding = state.uri.toString() == '/';
      final isGoingToLogin = state.uri.toString() == '/login';

      if (!hasSeenOnboarding && !isGoingToOnboarding) {
        return '/';
      }

      if (hasSeenOnboarding && !isLoggedIn && !isGoingToLogin) {
        return '/login';
      }

      if (isLoggedIn && (isGoingToOnboarding || isGoingToLogin)) {
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const OnboardingView(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginView(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeView(),
      ),
    ],
  );
}
