/// Model representing a single data point for the vital-signs trend chart
/// on the Home screen. Each point corresponds to one medical record visit.
class VitalChartPoint {
  /// Date of the medical examination.
  final DateTime date;

  /// Heart rate in beats per minute (bpm).
  final double heartRate;

  /// Systolic blood pressure in mmHg (upper value from e.g. "148/92").
  final double systolic;

  /// Respiratory rate in breaths per minute.
  final double respRate;

  /// Body temperature in °C.
  final double temperature;

  const VitalChartPoint({
    required this.date,
    required this.heartRate,
    required this.systolic,
    required this.respRate,
    required this.temperature,
  });
}
