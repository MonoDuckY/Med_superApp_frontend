import 'package:flutter/material.dart';
import '../models/counter_model.dart';

class CounterViewModel extends ChangeNotifier {
  final CounterModel _counter = CounterModel();

  int get counter => _counter.value;

  void incrementCounter() {
    _counter.value++;
    notifyListeners();
  }
}
