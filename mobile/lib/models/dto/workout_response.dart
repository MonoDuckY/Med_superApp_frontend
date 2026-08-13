import 'meal_response.dart';

/// UC-08 — Model bài tập thể dục (mirrors backend WorkoutResponse).
class WorkoutResponse {
  final String id;
  final String userId;
  final String? prescriptionId;
  final String workoutName;
  final String? content;
  final DateTime scheduledAt;
  final PlanScheduleStatus status;
  final String? note;

  const WorkoutResponse({
    required this.id,
    required this.userId,
    this.prescriptionId,
    required this.workoutName,
    this.content,
    required this.scheduledAt,
    required this.status,
    this.note,
  });

  factory WorkoutResponse.fromJson(Map<String, dynamic> json) {
    return WorkoutResponse(
      id: json['id'] as String,
      userId: json['userId'] as String,
      prescriptionId: json['prescriptionId'] as String?,
      workoutName: json['workoutName'] as String,
      content: json['content'] as String?,
      scheduledAt: DateTime.parse(json['scheduledAt'] as String).toLocal(),
      status: PlanScheduleStatus.fromString(json['status'] as String),
      note: json['note'] as String?,
    );
  }

  WorkoutResponse copyWith({PlanScheduleStatus? status}) {
    return WorkoutResponse(
      id: id,
      userId: userId,
      prescriptionId: prescriptionId,
      workoutName: workoutName,
      content: content,
      scheduledAt: scheduledAt,
      status: status ?? this.status,
      note: note,
    );
  }
}
