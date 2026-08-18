import 'package:flutter_test/flutter_test.dart';
import 'package:med_superapp_frontend/models/dto/doctor_examination_response.dart';
import 'package:med_superapp_frontend/models/medical_record_model.dart';
import 'package:med_superapp_frontend/services/mock/mock_auth_service.dart';
import 'package:med_superapp_frontend/services/mock/mock_medical_record_service.dart';
import 'package:med_superapp_frontend/view_models/medical_record_viewmodel.dart';
import 'package:med_superapp_frontend/view_models/medical_record_detail_viewmodel.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Medical Record DTO Tests', () {
    test('DoctorExaminationResponseDto parses backend JSON structure correctly', () {
      final sampleJson = {
        'appointment': {
          'id': 'apt-999',
          'patientId': 'user-123',
          'doctorWorkSlotId': 'slot-123',
          'status': 'COMPLETED',
          'requestedAt': '2026-07-23T09:15:00Z',
          'doctor': {
            'id': 'doc-1',
            'fullName': 'BS. Nguyễn Thị Lan',
            'phoneNumber': '0912345678',
          },
          'doctorWorkSlot': {
            'id': 'slot-123',
            'doctorId': 'doc-1',
            'workDate': '2026-07-23',
            'slotId': 'SLOT_01',
            'roomId': 'ROOM_01',
            'status': 'CLOSED',
          },
          'slot': {
            'id': 'SLOT_01',
            'startTime': '09:15',
            'endTime': '09:45',
          },
          'room': {
            'id': 'A101',
            'name': 'Phòng Tim Mạch',
          },
        },
        'patient': {
          'id': 'user-123',
          'fullName': 'Nguyễn Văn A',
          'dateOfBirth': '1990-05-15',
          'medicalHistory': 'Tăng huyết áp',
          'currentSickness': 'Tức ngực nhẹ',
          'bloodType': 'O+',
        },
        'medicalRecord': {
          'id': 'mr-001',
          'appointmentId': 'apt-999',
          'diagnosis': 'I10 - Tăng huyết áp vô căn',
          'note': 'Ăn nhạt, vận động nhẹ nhàng',
          'bloodPressure': '140/90',
          'heartRate': 82,
          'breathingRate': 18,
          'bodyTemperature': 36.8,
          'bloodLipids': 5.4,
          'medicalImages': [
            {
              'imageId': 'img-01',
              'url': 'https://storage.example.com/ultrasound.jpg',
              'expiresAt': '2026-07-24T00:00:00Z',
            }
          ],
        },
        'prescriptions': [
          {
            'id': 'pres-01',
            'medicalRecordId': 'mr-001',
            'content': 'Uống thuốc đúng giờ',
            'medicineSchedules': [
              {
                'id': 'ms-01',
                'medicineName': 'Amlodipine',
                'dosage': '5mg',
                'scheduledAt': '2026-07-24T08:00:00Z',
                'status': 'NOT_YET',
                'prescriptionId': 'pres-01',
                'note': 'Uống sau ăn sáng',
              }
            ],
            'meals': [],
            'workouts': [],
          }
        ],
      };

      final dto = DoctorExaminationResponseDto.fromJson(sampleJson);

      expect(dto.appointment.id, 'apt-999');
      expect(dto.appointment.status, 'COMPLETED');
      expect(dto.patient?.fullName, 'Nguyễn Văn A');
      expect(dto.patient?.dateOfBirth, '1990-05-15');
      expect(dto.patient?.medicalHistory, 'Tăng huyết áp');
      expect(dto.medicalRecord?.diagnosis, 'I10 - Tăng huyết áp vô căn');
      expect(dto.medicalRecord?.heartRate, 82);
      expect(dto.medicalRecord?.medicalImages.length, 1);
      expect(dto.medicalRecord?.medicalImages.first.url, 'https://storage.example.com/ultrasound.jpg');
      expect(dto.prescriptions.length, 1);
      expect(dto.prescriptions.first.medicineSchedules.first.medicineName, 'Amlodipine');
    });
  });

  group('Medical Record ViewModels Tests', () {
    test('MedicalRecordViewModel loads records, profile info, and filters properly', () async {
      final vm = MedicalRecordViewModel(
        service: MockMedicalRecordService(),
        authService: MockAuthService(),
      );
      expect(vm.isLoading, false);

      await vm.loadRecords();

      expect(vm.filteredRecords.isNotEmpty, true);
      expect(vm.recordsByYear.containsKey(2026), true);
      expect(vm.userInitials, isNotEmpty);
      expect(vm.dobDisplay, isNotEmpty);
      expect(vm.patientSubtitle, isNotEmpty);

      vm.setFilter(MedicalRecordFilter.completed);
      expect(
        vm.filteredRecords.every((r) => r.status == MedicalRecordStatus.completed),
        true,
      );

      vm.setFilter(MedicalRecordFilter.ongoing);
      expect(
        vm.filteredRecords.every((r) => r.status == MedicalRecordStatus.ongoing),
        true,
      );
    });

    test('MedicalRecordDetailViewModel loads detail with vitals and prescription', () async {
      final vm = MedicalRecordDetailViewModel(
        recordId: 'rec-001',
        service: MockMedicalRecordService(),
      );

      await vm.loadDetail();

      expect(vm.isLoading, false);
      expect(vm.detail, isNotNull);
      expect(vm.detail!.vitalSigns, isNotNull);
      expect(vm.hasPrescriptions, true);
      expect(vm.hasAttachedImages, true);
    });
  });
}
