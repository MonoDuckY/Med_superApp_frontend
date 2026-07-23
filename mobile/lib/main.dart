import 'package:flutter/material.dart';
import 'core/app_theme.dart';
import 'core/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MedSuperApp());
}

class MedSuperApp extends StatelessWidget {
  const MedSuperApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Med SuperApp',
      theme: AppTheme.lightTheme,
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
    );
  }
}
