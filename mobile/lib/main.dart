import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'services/abstract/auth_service_abstract.dart';
import 'services/mock/mock_auth_service.dart';
import 'services/remote/auth_service.dart';
import 'utils/router.dart';
import 'view_models/counter_view_model.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        // --- Service Injection ---
        // Đổi useMockServices = false trong AppConstants để dùng API thật
        Provider<AuthServiceAbstract>(
          create: (_) => AppConstants.useMockServices
              ? MockAuthService()
              : RemoteAuthService(),
        ),

        // --- ViewModels ---
        ChangeNotifierProvider(create: (_) => CounterViewModel()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Med SuperApp',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
