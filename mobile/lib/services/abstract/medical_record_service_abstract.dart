import '../../models/medical_record_model.dart';

abstract class IMedicalRecordService {
  /// Fetch all examination records for the current patient.
  Future<List<MedicalRecord>> getRecords();

  /// Fetch full detail for a specific record by [id].
  Future<MedicalRecordDetail?> getRecordDetail(String id);
}
