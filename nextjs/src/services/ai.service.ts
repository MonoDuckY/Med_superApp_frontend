export interface DiagnosticResponse {
  success: boolean;
  message: string;
  data: {
    info: any;
    image: {
      width: number;
      height: number;
      patient_id: string;
      processed_image_base64: string;
    };
    annotations: any[];
  } | null;
  errorCode: string | null;
}

export const AiService = {
  /**
   * Gọi API sang Spring Boot để chẩn đoán ảnh siêu âm
   */
  async analyzeUltrasound(file: File, patientId: string = "Unknown"): Promise<DiagnosticResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);

    // Lưu ý: Trong môi trường thực tế, base URL này nên được cấu hình trong .env (vd: NEXT_PUBLIC_API_URL)
    const response = await fetch("http://localhost:8080/api/ai/diagnose", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Backend Spring Boot trả thẳng chuỗi JSON của Python
    return await response.json();
  }
};
