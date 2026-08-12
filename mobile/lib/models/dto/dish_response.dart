/// UC-08 — Model cho một món ăn trong bữa (mirrors backend DishResponse).
class DishResponse {
  final String id;
  final String dishName;
  final double quantity;
  final String unit;
  final double? totalCalories;
  final double? totalProtein;
  final double? totalCarbohydrates;
  final double? totalFat;

  const DishResponse({
    required this.id,
    required this.dishName,
    required this.quantity,
    required this.unit,
    this.totalCalories,
    this.totalProtein,
    this.totalCarbohydrates,
    this.totalFat,
  });

  factory DishResponse.fromJson(Map<String, dynamic> json) {
    return DishResponse(
      id: json['id'] as String? ?? '',
      dishName: json['dishName'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String,
      totalCalories: (json['totalCalories'] as num?)?.toDouble(),
      totalProtein: (json['totalProtein'] as num?)?.toDouble(),
      totalCarbohydrates: (json['totalCarbohydrates'] as num?)?.toDouble(),
      totalFat: (json['totalFat'] as num?)?.toDouble(),
    );
  }

  /// Hiển thị ngắn gọn: "100g Cơm • 280 kcal"
  String get displaySummary {
    final calText = totalCalories != null ? ' • ${totalCalories!.toStringAsFixed(0)} kcal' : '';
    return '${quantity.toStringAsFixed(quantity.truncateToDouble() == quantity ? 0 : 1)}$unit $dishName$calText';
  }
}
