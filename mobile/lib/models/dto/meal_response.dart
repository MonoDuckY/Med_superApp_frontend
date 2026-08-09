import 'dish_response.dart';

// ── Status Enum (mirrors backend PlanScheduleStatus) ──────────────────────────

enum PlanScheduleStatus {
  notYet,
  completed,
  missed;

  static PlanScheduleStatus fromString(String value) {
    switch (value.toUpperCase()) {
      case 'COMPLETED':
        return PlanScheduleStatus.completed;
      case 'MISSED':
        return PlanScheduleStatus.missed;
      default:
        return PlanScheduleStatus.notYet;
    }
  }

  String get label {
    switch (this) {
      case PlanScheduleStatus.completed:
        return 'Đã hoàn thành';
      case PlanScheduleStatus.missed:
        return 'Bỏ lỡ';
      case PlanScheduleStatus.notYet:
        return 'Chưa thực hiện';
    }
  }

  bool get isDone => this == PlanScheduleStatus.completed;
}

// ── Model ─────────────────────────────────────────────────────────────────────

/// UC-08 — Model bữa ăn (mirrors backend MealResponse).
class MealResponse {
  final String id;
  final String userId;
  final String? prescriptionId;
  final String mealName;
  final DateTime scheduledAt;
  final PlanScheduleStatus status;
  final String? note;
  final List<DishResponse> dishes;

  const MealResponse({
    required this.id,
    required this.userId,
    this.prescriptionId,
    required this.mealName,
    required this.scheduledAt,
    required this.status,
    this.note,
    required this.dishes,
  });

  factory MealResponse.fromJson(Map<String, dynamic> json) {
    final dishList = (json['dishes'] as List<dynamic>? ?? [])
        .map((e) => DishResponse.fromJson(e as Map<String, dynamic>))
        .toList();

    return MealResponse(
      id: json['id'] as String,
      userId: json['userId'] as String,
      prescriptionId: json['prescriptionId'] as String?,
      mealName: json['mealName'] as String,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String).toLocal(),
      status: PlanScheduleStatus.fromString(json['status'] as String),
      note: json['note'] as String?,
      dishes: dishList,
    );
  }

  /// Tổng calo của bữa ăn (sum tất cả món)
  double get totalCalories =>
      dishes.fold(0.0, (sum, d) => sum + (d.totalCalories ?? 0.0));

  MealResponse copyWith({PlanScheduleStatus? status}) {
    return MealResponse(
      id: id,
      userId: userId,
      prescriptionId: prescriptionId,
      mealName: mealName,
      scheduledAt: scheduledAt,
      status: status ?? this.status,
      note: note,
      dishes: dishes,
    );
  }
}
