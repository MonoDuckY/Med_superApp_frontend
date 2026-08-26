import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_vi.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('vi'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In vi, this message translates to:
  /// **'HMS Y tế'**
  String get appTitle;

  /// No description provided for @login.
  ///
  /// In vi, this message translates to:
  /// **'Đăng nhập'**
  String get login;

  /// No description provided for @phoneNumber.
  ///
  /// In vi, this message translates to:
  /// **'Số điện thoại'**
  String get phoneNumber;

  /// No description provided for @phoneNumberHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập số điện thoại (vd: 0912345678)'**
  String get phoneNumberHint;

  /// No description provided for @phoneInvalid.
  ///
  /// In vi, this message translates to:
  /// **'Số điện thoại không hợp lệ'**
  String get phoneInvalid;

  /// No description provided for @enterOtp.
  ///
  /// In vi, this message translates to:
  /// **'Nhập mã OTP'**
  String get enterOtp;

  /// No description provided for @otpSentTo.
  ///
  /// In vi, this message translates to:
  /// **'Mã xác thực đã được gửi tới số'**
  String get otpSentTo;

  /// No description provided for @verify.
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận'**
  String get verify;

  /// No description provided for @resendOtp.
  ///
  /// In vi, this message translates to:
  /// **'Gửi lại mã'**
  String get resendOtp;

  /// No description provided for @resendIn.
  ///
  /// In vi, this message translates to:
  /// **'Gửi lại sau {time}'**
  String resendIn(String time);

  /// No description provided for @devMode.
  ///
  /// In vi, this message translates to:
  /// **'CHẾ ĐỘ NHÀ PHÁT TRIỂN'**
  String get devMode;

  /// No description provided for @useMockData.
  ///
  /// In vi, this message translates to:
  /// **'Sử dụng dữ liệu Mock'**
  String get useMockData;

  /// No description provided for @skipLogin.
  ///
  /// In vi, this message translates to:
  /// **'Bỏ qua đăng nhập'**
  String get skipLogin;

  /// No description provided for @home.
  ///
  /// In vi, this message translates to:
  /// **'Trang chủ'**
  String get home;

  /// No description provided for @appointments.
  ///
  /// In vi, this message translates to:
  /// **'Lịch khám'**
  String get appointments;

  /// No description provided for @health.
  ///
  /// In vi, this message translates to:
  /// **'Sức khỏe'**
  String get health;

  /// No description provided for @profile.
  ///
  /// In vi, this message translates to:
  /// **'Hồ sơ'**
  String get profile;

  /// No description provided for @notifications.
  ///
  /// In vi, this message translates to:
  /// **'Thông báo'**
  String get notifications;

  /// No description provided for @feedback.
  ///
  /// In vi, this message translates to:
  /// **'Đánh giá & Góp ý'**
  String get feedback;

  /// No description provided for @medicalRecords.
  ///
  /// In vi, this message translates to:
  /// **'Hồ sơ bệnh án'**
  String get medicalRecords;

  /// No description provided for @personalInfo.
  ///
  /// In vi, this message translates to:
  /// **'Thông tin cá nhân'**
  String get personalInfo;

  /// No description provided for @logout.
  ///
  /// In vi, this message translates to:
  /// **'Đăng xuất'**
  String get logout;

  /// No description provided for @cancel.
  ///
  /// In vi, this message translates to:
  /// **'Hủy'**
  String get cancel;

  /// No description provided for @close.
  ///
  /// In vi, this message translates to:
  /// **'Đóng'**
  String get close;

  /// No description provided for @confirm.
  ///
  /// In vi, this message translates to:
  /// **'Xác nhận'**
  String get confirm;

  /// No description provided for @cancelAppointment.
  ///
  /// In vi, this message translates to:
  /// **'Hủy lịch khám'**
  String get cancelAppointment;

  /// No description provided for @cancelAppointmentReason.
  ///
  /// In vi, this message translates to:
  /// **'Vui lòng nhập lý do hủy lịch:'**
  String get cancelAppointmentReason;

  /// No description provided for @cancelAppointmentReasonHint.
  ///
  /// In vi, this message translates to:
  /// **'Nhập lý do...'**
  String get cancelAppointmentReasonHint;

  /// No description provided for @cancelSuccess.
  ///
  /// In vi, this message translates to:
  /// **'Hủy lịch khám thành công.'**
  String get cancelSuccess;

  /// No description provided for @cancelFailed.
  ///
  /// In vi, this message translates to:
  /// **'Không thể hủy lịch khám. Vui lòng thử lại.'**
  String get cancelFailed;

  /// No description provided for @appointmentDetails.
  ///
  /// In vi, this message translates to:
  /// **'Chi tiết lịch khám'**
  String get appointmentDetails;

  /// No description provided for @appointmentSummary.
  ///
  /// In vi, this message translates to:
  /// **'Tóm tắt lịch khám'**
  String get appointmentSummary;

  /// No description provided for @appointmentDate.
  ///
  /// In vi, this message translates to:
  /// **'Ngày khám'**
  String get appointmentDate;

  /// No description provided for @timeSlot.
  ///
  /// In vi, this message translates to:
  /// **'Khung giờ'**
  String get timeSlot;

  /// No description provided for @specialty.
  ///
  /// In vi, this message translates to:
  /// **'Chuyên khoa'**
  String get specialty;

  /// No description provided for @doctor.
  ///
  /// In vi, this message translates to:
  /// **'Bác sĩ'**
  String get doctor;

  /// No description provided for @location.
  ///
  /// In vi, this message translates to:
  /// **'Địa điểm'**
  String get location;

  /// No description provided for @statusPending.
  ///
  /// In vi, this message translates to:
  /// **'Chờ xác nhận'**
  String get statusPending;

  /// No description provided for @statusConfirmed.
  ///
  /// In vi, this message translates to:
  /// **'Đã xác nhận'**
  String get statusConfirmed;

  /// No description provided for @statusCompleted.
  ///
  /// In vi, this message translates to:
  /// **'Đã hoàn thành'**
  String get statusCompleted;

  /// No description provided for @statusCancelled.
  ///
  /// In vi, this message translates to:
  /// **'Đã hủy'**
  String get statusCancelled;

  /// No description provided for @bookAppointment.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lịch khám'**
  String get bookAppointment;

  /// No description provided for @bookNewAppointment.
  ///
  /// In vi, this message translates to:
  /// **'Đặt lịch mới'**
  String get bookNewAppointment;

  /// No description provided for @search.
  ///
  /// In vi, this message translates to:
  /// **'Tìm kiếm'**
  String get search;

  /// No description provided for @noData.
  ///
  /// In vi, this message translates to:
  /// **'Không có dữ liệu'**
  String get noData;

  /// No description provided for @loading.
  ///
  /// In vi, this message translates to:
  /// **'Đang tải...'**
  String get loading;

  /// No description provided for @networkError.
  ///
  /// In vi, this message translates to:
  /// **'Lỗi kết nối mạng'**
  String get networkError;

  /// No description provided for @systemError.
  ///
  /// In vi, this message translates to:
  /// **'Đã xảy ra lỗi hệ thống'**
  String get systemError;

  /// No description provided for @dailyActivities.
  ///
  /// In vi, this message translates to:
  /// **'Hoạt động hàng ngày'**
  String get dailyActivities;

  /// No description provided for @medicineSchedule.
  ///
  /// In vi, this message translates to:
  /// **'Lịch uống thuốc'**
  String get medicineSchedule;

  /// No description provided for @meals.
  ///
  /// In vi, this message translates to:
  /// **'Bữa ăn'**
  String get meals;

  /// No description provided for @workouts.
  ///
  /// In vi, this message translates to:
  /// **'Luyện tập'**
  String get workouts;

  /// No description provided for @addMeal.
  ///
  /// In vi, this message translates to:
  /// **'Thêm bữa ăn'**
  String get addMeal;

  /// No description provided for @addWorkout.
  ///
  /// In vi, this message translates to:
  /// **'Thêm bài tập'**
  String get addWorkout;

  /// No description provided for @calories.
  ///
  /// In vi, this message translates to:
  /// **'Calories'**
  String get calories;

  /// No description provided for @dishName.
  ///
  /// In vi, this message translates to:
  /// **'Tên món ăn'**
  String get dishName;

  /// No description provided for @quantity.
  ///
  /// In vi, this message translates to:
  /// **'Số lượng'**
  String get quantity;

  /// No description provided for @unit.
  ///
  /// In vi, this message translates to:
  /// **'Đơn vị'**
  String get unit;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'vi'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'vi':
      return AppLocalizationsVi();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
