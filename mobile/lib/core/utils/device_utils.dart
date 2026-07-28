import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';

class DeviceUtils {
  static final DeviceInfoPlugin _deviceInfoPlugin = DeviceInfoPlugin();

  /// Lấy ID thiết bị duy nhất cho Android và iOS
  static Future<String?> getDeviceId() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfoPlugin.androidInfo;
        return androidInfo.id; // Unique ID cho Android
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfoPlugin.iosInfo;
        return iosInfo.identifierForVendor; // Unique ID cho iOS
      }
    } catch (e) {
      // Ignore errors and return null if cannot fetch device ID
    }
    return null;
  }
}
