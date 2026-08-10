import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/app_theme.dart';
import 'core/app_router.dart';
import 'core/config/environment_config.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi', null);
  await EnvironmentConfig.init();
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
