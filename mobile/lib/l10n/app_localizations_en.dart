// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'HMS Health';

  @override
  String get login => 'Sign In';

  @override
  String get phoneNumber => 'Phone Number';

  @override
  String get phoneNumberHint => 'Enter phone number (e.g. 0912345678)';

  @override
  String get phoneInvalid => 'Invalid phone number';

  @override
  String get enterOtp => 'Enter OTP Code';

  @override
  String get otpSentTo => 'Verification code sent to';

  @override
  String get verify => 'Verify';

  @override
  String get resendOtp => 'Resend Code';

  @override
  String resendIn(String time) {
    return 'Resend in $time';
  }

  @override
  String get devMode => 'DEVELOPER MODE';

  @override
  String get useMockData => 'Use Mock Data';

  @override
  String get skipLogin => 'Bypass Login';

  @override
  String get home => 'Home';

  @override
  String get appointments => 'Appointments';

  @override
  String get health => 'Health';

  @override
  String get profile => 'Profile';

  @override
  String get notifications => 'Notifications';

  @override
  String get feedback => 'Feedback';

  @override
  String get medicalRecords => 'Medical Records';

  @override
  String get personalInfo => 'Personal Information';

  @override
  String get logout => 'Sign Out';

  @override
  String get cancel => 'Cancel';

  @override
  String get close => 'Close';

  @override
  String get confirm => 'Confirm';

  @override
  String get cancelAppointment => 'Cancel Appointment';

  @override
  String get cancelAppointmentReason => 'Please enter cancellation reason:';

  @override
  String get cancelAppointmentReasonHint => 'Enter reason...';

  @override
  String get cancelSuccess => 'Appointment cancelled successfully.';

  @override
  String get cancelFailed => 'Failed to cancel appointment. Please try again.';

  @override
  String get appointmentDetails => 'Appointment Details';

  @override
  String get appointmentSummary => 'Appointment Summary';

  @override
  String get appointmentDate => 'Date';

  @override
  String get timeSlot => 'Time Slot';

  @override
  String get specialty => 'Specialty';

  @override
  String get doctor => 'Doctor';

  @override
  String get location => 'Location';

  @override
  String get statusPending => 'Pending Confirmation';

  @override
  String get statusConfirmed => 'Confirmed';

  @override
  String get statusCompleted => 'Completed';

  @override
  String get statusCancelled => 'Cancelled';

  @override
  String get bookAppointment => 'Book Appointment';

  @override
  String get bookNewAppointment => 'Book New';

  @override
  String get search => 'Search';

  @override
  String get noData => 'No data available';

  @override
  String get loading => 'Loading...';

  @override
  String get networkError => 'Network connection error';

  @override
  String get systemError => 'System error occurred';

  @override
  String get dailyActivities => 'Daily Activities';

  @override
  String get medicineSchedule => 'Medication Schedule';

  @override
  String get meals => 'Meals';

  @override
  String get workouts => 'Workouts';

  @override
  String get addMeal => 'Add Meal';

  @override
  String get addWorkout => 'Add Workout';

  @override
  String get calories => 'Calories';

  @override
  String get dishName => 'Dish Name';

  @override
  String get quantity => 'Quantity';

  @override
  String get unit => 'Unit';
}
