import '../../models/medical_record_model.dart';
import '../abstract/medical_record_service_abstract.dart';

class MockMedicalRecordService implements IMedicalRecordService {
  // ── Mock doctors ───────────────────────────────────────────────────────────
  static const _drLan = AttendingDoctor(
    initials: 'NL',
    name: 'BS. Nguyễn Thị Lan',
    specialties: ['Nội tổng quát', 'Tim mạch'],
    hospital: 'A101-PhòngA',
  );
  static const _drTan = AttendingDoctor(
    initials: 'TL',
    name: 'BS. Trần Thị Lan',
    specialties: ['Nội khoa'],
    hospital: 'A102-PhòngB',
  );
  static const _drPhuc = AttendingDoctor(
    initials: 'VP',
    name: 'BS. Lê Văn Phúc',
    specialties: ['Hô hấp'],
    hospital: 'B201-PhòngC',
  );
  static const _drHa = AttendingDoctor(
    initials: 'TH',
    name: 'BS. Phạm Thị Hà',
    specialties: ['Xét nghiệm', 'Huyết học'],
    hospital: 'B202-PhòngD',
  );
  static const _drTuan = AttendingDoctor(
    initials: 'AT',
    name: 'BS. Hoàng Anh Tuấn',
    specialties: ['Chẩn đoán hình ảnh'],
    hospital: 'C301-PhòngE',
  );

  // ── Mock list ──────────────────────────────────────────────────────────────
  static final _records = <MedicalRecord>[
    MedicalRecord(
      id: 'rec-001',
      dateTime: DateTime(2026, 7, 23, 9, 15),
      status: MedicalRecordStatus.ongoing,
      examinationName: 'Theo dõi tim mạch định kỳ',
      specialty: 'Tim mạch',
      doctor: _drLan,
      icdCode: 'I10',
      diagnosisBrief: 'Tăng huyết áp vô căn (nguyên phát)',
      hasLabResults: true,
      hasPrescription: true,
      resultAvailable: true,
    ),
    MedicalRecord(
      id: 'rec-002',
      dateTime: DateTime(2026, 6, 14, 14, 30),
      status: MedicalRecordStatus.completed,
      examinationName: 'Khám nội tổng quát',
      specialty: 'Nội khoa',
      doctor: _drTan,
      icdCode: 'Z00',
      diagnosisBrief: 'Kiểm tra sức khỏe định kỳ toàn diện',
      hasLabResults: true,
      hasPrescription: false,
      resultAvailable: true,
    ),
    MedicalRecord(
      id: 'rec-003',
      dateTime: DateTime(2026, 5, 2, 10, 0),
      status: MedicalRecordStatus.completed,
      examinationName: 'Điều trị nhiễm trùng hô hấp',
      specialty: 'Hô hấp',
      doctor: _drPhuc,
      icdCode: 'J06.9',
      diagnosisBrief: 'Nhiễm trùng đường hô hấp trên cấp tính',
      hasLabResults: true,
      hasPrescription: true,
      resultAvailable: true,
    ),
    MedicalRecord(
      id: 'rec-004',
      dateTime: DateTime(2026, 3, 18, 8, 45),
      status: MedicalRecordStatus.completed,
      examinationName: 'Xét nghiệm máu & Lipid máu',
      specialty: 'Xét nghiệm',
      doctor: _drHa,
      icdCode: 'E78.5',
      diagnosisBrief: 'Rối loạn lipid máu',
      hasLabResults: true,
      hasPrescription: true,
      resultAvailable: true,
    ),
    // AF-02: Kết quả chưa sẵn sàng
    MedicalRecord(
      id: 'rec-005',
      dateTime: DateTime(2026, 2, 5, 13, 0),
      status: MedicalRecordStatus.completed,
      examinationName: 'Chụp CT bụng tổng quát',
      specialty: 'Chẩn đoán hình ảnh',
      doctor: _drTuan,
      icdCode: null,
      diagnosisBrief: null,
      hasLabResults: false,
      hasPrescription: false,
      resultAvailable: false, // AF-02
    ),
    // 2025
    MedicalRecord(
      id: 'rec-006',
      dateTime: DateTime(2025, 11, 8, 11, 20),
      status: MedicalRecordStatus.completed,
      examinationName: 'Xem xét kết quả CT bụng',
      specialty: 'Chẩn đoán hình ảnh',
      doctor: _drTuan,
      icdCode: 'K57.30',
      diagnosisBrief: 'Túi thừa đại tràng không biến chứng',
      hasLabResults: true,
      hasPrescription: true,
      resultAvailable: true,
    ),
  ];

  // ── Mock detail map ────────────────────────────────────────────────────────
  static final _details = <String, MedicalRecordDetail>{
    'rec-001': MedicalRecordDetail(
      summary: _records[0],
      vitalSigns: const VitalSigns(
        bloodPressure: '148/92',
        bloodPressureStatus: VitalStatus.high,
        heartRate: 78,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 16,
        respiratoryRateStatus: VitalStatus.normal,
        bodyTemperature: 36.7,
        bodyTemperatureStatus: VitalStatus.normal,
        bloodSugar: 5.2,
        bloodSugarStatus: VitalStatus.normal,
      ),
      diagnosis: const Diagnosis(
        icdCode: 'I10',
        nameVi: 'Tăng huyết áp vô căn (nguyên phát)',
        nameEn: 'Elevated arterial blood pressure without identifiable cause — primary hypertension',
      ),
      clinicalNotes: const [
        ClinicalNote(
          type: ClinicalNoteType.doctorReview,
          content: 'Bệnh nhân có chỉ số huyết áp tâm thu cao nhẹ trong 3 tháng qua. Cần tiếp tục theo dõi và điều chỉnh liều thuốc.',
          date: null,
          authorName: 'BS. Nguyễn Thị Lan',
        ),
        ClinicalNote(
          type: ClinicalNoteType.lifestyle,
          content: 'Cần điều chỉnh lối sống: giảm muối, đi bộ 30 phút mỗi ngày, tránh căng thẳng.',
        ),
        ClinicalNote(
          type: ClinicalNoteType.followUp,
          content: 'Theo dõi huyết áp hàng tuần. Tái khám sau 4 tuần hoặc khi có triệu chứng bất thường.',
        ),
      ],
      prescriptions: const [
        PrescriptionItem(
          medicineName: 'Amlodipine',
          dosage: '5mg',
          frequency: '1 viên/ngày, uống buổi sáng',
          durationDays: 30,
          note: 'Không dừng thuốc đột ngột',
        ),
        PrescriptionItem(
          medicineName: 'Bisoprolol',
          dosage: '2.5mg',
          frequency: '1 viên/ngày, uống sau ăn sáng',
          durationDays: 30,
        ),
      ],
      attachedImages: [
        MedicalImageAttachment(
          id: 'img-001-a',
          imageType: 'X-Quang ngực',
          description: 'Chụp X-quang tim phổi thẳng',
          takenAt: DateTime(2026, 7, 23, 9, 30),
        ),
        MedicalImageAttachment(
          id: 'img-001-b',
          imageType: 'Điện tâm đồ',
          description: 'ECG 12 chuyển đạo',
          takenAt: DateTime(2026, 7, 23, 9, 45),
        ),
      ],
    ),

    'rec-002': MedicalRecordDetail(
      summary: _records[1],
      vitalSigns: const VitalSigns(
        bloodPressure: '120/80',
        bloodPressureStatus: VitalStatus.normal,
        heartRate: 72,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 18,
        respiratoryRateStatus: VitalStatus.normal,
        bodyTemperature: 36.5,
        bodyTemperatureStatus: VitalStatus.normal,
        bloodSugar: 4.9,
        bloodSugarStatus: VitalStatus.normal,
      ),
      diagnosis: const Diagnosis(
        icdCode: 'Z00',
        nameVi: 'Kiểm tra sức khỏe định kỳ toàn diện',
        nameEn: 'General adult medical examination — routine health check',
      ),
      clinicalNotes: const [
        ClinicalNote(
          type: ClinicalNoteType.doctorReview,
          content: 'Tổng trạng sức khỏe tốt. Các chỉ số sinh hóa trong giới hạn bình thường.',
          authorName: 'BS. Trần Thị Lan',
        ),
        ClinicalNote(
          type: ClinicalNoteType.recommendation,
          content: 'Bổ sung Vitamin D3 và Omega-3 để duy trì sức khỏe xương khớp và tim mạch.',
        ),
      ],
      prescriptions: const [
        PrescriptionItem(
          medicineName: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: '1 viên/ngày, sau ăn',
          durationDays: 60,
        ),
        PrescriptionItem(
          medicineName: 'Omega-3',
          dosage: '1000mg',
          frequency: '1 viên/ngày, sau ăn tối',
          durationDays: 60,
        ),
      ],
      attachedImages: [
        MedicalImageAttachment(
          id: 'img-002-a',
          imageType: 'Kết quả xét nghiệm máu',
          description: 'CBC, Lipid panel, Glucose, HbA1c',
          takenAt: DateTime(2026, 6, 14, 14, 0),
        ),
      ],
    ),

    'rec-003': MedicalRecordDetail(
      summary: _records[2],
      vitalSigns: const VitalSigns(
        bloodPressure: '118/76',
        bloodPressureStatus: VitalStatus.normal,
        heartRate: 88,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 22,
        respiratoryRateStatus: VitalStatus.high,
        bodyTemperature: 38.2,
        bodyTemperatureStatus: VitalStatus.high,
      ),
      diagnosis: const Diagnosis(
        icdCode: 'J06.9',
        nameVi: 'Nhiễm trùng đường hô hấp trên cấp tính',
        nameEn: 'Acute upper respiratory infection, unspecified',
      ),
      clinicalNotes: const [
        ClinicalNote(
          type: ClinicalNoteType.doctorReview,
          content: 'Bệnh nhân sốt nhẹ 38.2°C, ho khan, đau họng 3 ngày. Khám họng: đỏ, không có mủ. Phổi trong.',
          authorName: 'BS. Lê Văn Phúc',
        ),
        ClinicalNote(
          type: ClinicalNoteType.recommendation,
          content: 'Nghỉ ngơi, uống nhiều nước, súc miệng nước muối ấm 3-4 lần/ngày.',
        ),
        ClinicalNote(
          type: ClinicalNoteType.followUp,
          content: 'Tái khám nếu sốt trên 39°C hoặc triệu chứng không cải thiện sau 5 ngày.',
        ),
      ],
      prescriptions: const [
        PrescriptionItem(
          medicineName: 'Paracetamol',
          dosage: '500mg',
          frequency: '1-2 viên mỗi 6 giờ khi sốt hoặc đau',
          durationDays: 5,
          note: 'Không quá 8 viên/ngày',
        ),
        PrescriptionItem(
          medicineName: 'Loratadine',
          dosage: '10mg',
          frequency: '1 viên/ngày, buổi tối',
          durationDays: 5,
        ),
        PrescriptionItem(
          medicineName: 'Strepsils',
          dosage: 'Viên ngậm',
          frequency: 'Ngậm mỗi 2-3 giờ khi đau họng',
          durationDays: 5,
        ),
      ],
      attachedImages: [],
    ),

    'rec-004': MedicalRecordDetail(
      summary: _records[3],
      vitalSigns: const VitalSigns(
        bloodPressure: '122/80',
        bloodPressureStatus: VitalStatus.normal,
        heartRate: 70,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 16,
        respiratoryRateStatus: VitalStatus.normal,
        bodyTemperature: 36.4,
        bodyTemperatureStatus: VitalStatus.normal,
        bloodSugar: 4.9,
        bloodSugarStatus: VitalStatus.normal,
      ),
      diagnosis: const Diagnosis(
        icdCode: 'E78.5',
        nameVi: 'Rối loạn lipid máu hỗn hợp',
        nameEn: 'Hyperlipidaemia — elevated LDL and triglycerides',
      ),
      clinicalNotes: const [
        ClinicalNote(
          type: ClinicalNoteType.doctorReview,
          content: 'Cholesterol toàn phần: 6.2 mmol/L (cao). LDL: 4.1 mmol/L (cao). HDL: 1.1 mmol/L (bình thường). Triglycerides: 2.8 mmol/L (cao).',
          authorName: 'BS. Phạm Thị Hà',
        ),
        ClinicalNote(
          type: ClinicalNoteType.lifestyle,
          content: 'Hạn chế thực phẩm nhiều dầu mỡ, nội tạng động vật, thức ăn nhanh. Tăng cường rau xanh, cá hồi, yến mạch.',
        ),
        ClinicalNote(
          type: ClinicalNoteType.followUp,
          content: 'Xét nghiệm lại lipid máu sau 3 tháng để đánh giá hiệu quả điều trị.',
        ),
      ],
      prescriptions: const [
        PrescriptionItem(
          medicineName: 'Atorvastatin',
          dosage: '20mg',
          frequency: '1 viên/ngày, uống buổi tối',
          durationDays: 90,
          note: 'Theo dõi men gan sau 6 tuần',
        ),
      ],
      attachedImages: [
        MedicalImageAttachment(
          id: 'img-004-a',
          imageType: 'Kết quả xét nghiệm máu',
          description: 'Lipid panel đầy đủ: Cholesterol, LDL, HDL, Triglycerides',
          takenAt: DateTime(2026, 3, 18, 8, 0),
        ),
      ],
    ),

    // AF-02: Kết quả chưa sẵn sàng
    'rec-005': MedicalRecordDetail(
      summary: _records[4],
      vitalSigns: const VitalSigns(
        bloodPressure: '125/82',
        bloodPressureStatus: VitalStatus.normal,
        heartRate: 74,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 17,
        respiratoryRateStatus: VitalStatus.normal,
        bodyTemperature: 36.6,
        bodyTemperatureStatus: VitalStatus.normal,
      ),
      diagnosis: null, // resultAvailable = false
      clinicalNotes: const [],
      prescriptions: const [],
      attachedImages: const [],
    ),

    'rec-006': MedicalRecordDetail(
      summary: _records[5],
      vitalSigns: const VitalSigns(
        bloodPressure: '118/78',
        bloodPressureStatus: VitalStatus.normal,
        heartRate: 68,
        heartRateStatus: VitalStatus.normal,
        respiratoryRate: 16,
        respiratoryRateStatus: VitalStatus.normal,
        bodyTemperature: 36.5,
        bodyTemperatureStatus: VitalStatus.normal,
      ),
      diagnosis: const Diagnosis(
        icdCode: 'K57.30',
        nameVi: 'Túi thừa đại tràng không biến chứng',
        nameEn: 'Diverticular disease of large intestine without perforation or abscess',
      ),
      clinicalNotes: const [
        ClinicalNote(
          type: ClinicalNoteType.doctorReview,
          content: 'CT bụng phát hiện túi thừa ở đại tràng sigma. Kích thước nhỏ, không có dấu hiệu viêm hay biến chứng.',
          authorName: 'BS. Hoàng Anh Tuấn',
        ),
        ClinicalNote(
          type: ClinicalNoteType.lifestyle,
          content: 'Tăng cường chất xơ trong chế độ ăn: rau xanh, trái cây, ngũ cốc nguyên cám. Uống đủ 2 lít nước/ngày.',
        ),
        ClinicalNote(
          type: ClinicalNoteType.followUp,
          content: 'Theo dõi định kỳ 6 tháng/lần. Đến khám ngay nếu có đau bụng dữ dội, sốt, hoặc máu trong phân.',
        ),
      ],
      prescriptions: const [
        PrescriptionItem(
          medicineName: 'Mebeverine',
          dosage: '135mg',
          frequency: '1 viên x 3 lần/ngày, trước ăn 20 phút',
          durationDays: 30,
        ),
      ],
      attachedImages: [
        MedicalImageAttachment(
          id: 'img-006-a',
          imageType: 'CT Scan bụng',
          description: 'CT bụng có tiêm thuốc cản quang — mặt cắt ngang và dọc',
          takenAt: DateTime(2025, 11, 8, 10, 30),
        ),
        MedicalImageAttachment(
          id: 'img-006-b',
          imageType: 'Kết quả xét nghiệm máu',
          description: 'CBC, CRP, ESR — đánh giá tình trạng viêm',
          takenAt: DateTime(2025, 11, 8, 10, 0),
        ),
      ],
    ),
  };

  @override
  Future<List<MedicalRecord>> getRecords() async {
    await Future.delayed(const Duration(milliseconds: 700));
    return List.from(_records);
  }

  @override
  Future<MedicalRecordDetail?> getRecordDetail(String id) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _details[id];
  }
}
