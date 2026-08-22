// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Vietnamese (`vi`).
class AppLocalizationsVi extends AppLocalizations {
  AppLocalizationsVi([String locale = 'vi']) : super(locale);

  @override
  String get appTitle => 'HMS Y tế';

  @override
  String get login => 'Đăng nhập';

  @override
  String get phoneNumber => 'Số điện thoại';

  @override
  String get phoneNumberHint => 'Nhập số điện thoại (vd: 0912345678)';

  @override
  String get phoneInvalid => 'Số điện thoại không hợp lệ';

  @override
  String get enterOtp => 'Nhập mã OTP';

  @override
  String get otpSentTo => 'Mã xác thực đã được gửi tới số';

  @override
  String get verify => 'Xác nhận';

  @override
  String get resendOtp => 'Gửi lại mã';

  @override
  String resendIn(String time) {
    return 'Gửi lại sau $time';
  }

  @override
  String get devMode => 'CHẾ ĐỘ NHÀ PHÁT TRIỂN';

  @override
  String get useMockData => 'Sử dụng dữ liệu Mock';

  @override
  String get skipLogin => 'Bỏ qua đăng nhập';

  @override
  String get home => 'Trang chủ';

  @override
  String get appointments => 'Lịch khám';

  @override
  String get health => 'Sức khỏe';

  @override
  String get profile => 'Hồ sơ';

  @override
  String get notifications => 'Thông báo';

  @override
  String get feedback => 'Đánh giá & Góp ý';

  @override
  String get medicalRecords => 'Hồ sơ bệnh án';

  @override
  String get personalInfo => 'Thông tin cá nhân';

  @override
  String get logout => 'Đăng xuất';

  @override
  String get cancel => 'Hủy';

  @override
  String get close => 'Đóng';

  @override
  String get confirm => 'Xác nhận';

  @override
  String get cancelAppointment => 'Hủy lịch khám';

  @override
  String get cancelAppointmentReason => 'Vui lòng nhập lý do hủy lịch:';

  @override
  String get cancelAppointmentReasonHint => 'Nhập lý do...';

  @override
  String get cancelSuccess => 'Hủy lịch khám thành công.';

  @override
  String get cancelFailed => 'Không thể hủy lịch khám. Vui lòng thử lại.';

  @override
  String get appointmentDetails => 'Chi tiết lịch khám';

  @override
  String get appointmentSummary => 'Tóm tắt lịch khám';

  @override
  String get appointmentDate => 'Ngày khám';

  @override
  String get timeSlot => 'Khung giờ';

  @override
  String get specialty => 'Chuyên khoa';

  @override
  String get doctor => 'Bác sĩ';

  @override
  String get location => 'Địa điểm';

  @override
  String get statusPending => 'Chờ xác nhận';

  @override
  String get statusConfirmed => 'Đã xác nhận';

  @override
  String get statusCompleted => 'Đã hoàn thành';

  @override
  String get statusCancelled => 'Đã hủy';

  @override
  String get bookAppointment => 'Đặt lịch khám';

  @override
  String get bookNewAppointment => 'Đặt lịch mới';

  @override
  String get search => 'Tìm kiếm';

  @override
  String get noData => 'Không có dữ liệu';

  @override
  String get loading => 'Đang tải...';

  @override
  String get networkError => 'Lỗi kết nối mạng';

  @override
  String get systemError => 'Đã xảy ra lỗi hệ thống';

  @override
  String get dailyActivities => 'Hoạt động hàng ngày';

  @override
  String get medicineSchedule => 'Lịch uống thuốc';

  @override
  String get meals => 'Bữa ăn';

  @override
  String get workouts => 'Luyện tập';

  @override
  String get addMeal => 'Thêm bữa ăn';

  @override
  String get addWorkout => 'Thêm bài tập';

  @override
  String get calories => 'Calories';

  @override
  String get dishName => 'Tên món ăn';

  @override
  String get quantity => 'Số lượng';

  @override
  String get unit => 'Đơn vị';
}
