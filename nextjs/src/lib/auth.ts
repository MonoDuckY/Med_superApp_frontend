export interface LoginResponseData {
  accessToken: string;
  refreshToken?: string;
  user: {
    status: string;
    isActive: boolean;
    fullName?: string;
    phoneNumber?: string;
    role?: string;
    roles?: string[];
  };
}

export async function loginApiCall(phoneNumber: string, password: string): Promise<LoginResponseData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber,
      password,
    }),
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || "Login failed. Please check your credentials.");
    }
    
    const data = result.data;
    if (data && data.user) {
      const userStatus = data.user.status;
      if (userStatus === "Disabled" || userStatus === "DISABLED" || data.user.isActive === false) {
        throw new Error("This account is disabled. Please contact an administrator.");
      }
    }
    return data;
  } else {
    if (!res.ok) {
      throw new Error("HTTP connection error. Server returned " + res.status);
    }
    throw new Error("Invalid response format from server.");
  }
}

export async function requestForgotPasswordApiCall(phoneNumber: string): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/auth/forgot-password/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber }),
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
    }
  } else if (!res.ok) {
    throw new Error(`Lỗi HTTP ${res.status}: Gửi OTP thất bại.`);
  }
}

export async function verifyForgotPasswordOtpApiCall(
  phoneNumber: string,
  code: string
): Promise<{ resetToken: string; expiresInSeconds: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/auth/forgot-password/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phoneNumber, code }),
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || "Xác minh mã OTP thất bại.");
    }
    return result.data;
  } else {
    if (!res.ok) {
      throw new Error(`Lỗi HTTP ${res.status}: Xác minh mã OTP thất bại.`);
    }
    throw new Error("Phản hồi từ máy chủ không hợp lệ.");
  }
}

export async function resetPasswordApiCall(payload: {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const res = await fetch(`${apiUrl}/api/auth/forgot-password/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || "Đặt lại mật khẩu thất bại.");
    }
  } else if (!res.ok) {
    throw new Error(`Lỗi HTTP ${res.status}: Đặt lại mật khẩu thất bại.`);
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  let token = localStorage.getItem("authToken");

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const mergedOptions = {
    ...options,
    headers,
  };

  let res = await fetch(url, mergedOptions);

  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshResult = await refreshRes.json();
          if (refreshResult.success && refreshResult.data) {
            const newData = refreshResult.data;
            localStorage.setItem("authToken", newData.accessToken);
            if (newData.refreshToken) {
              localStorage.setItem("refreshToken", newData.refreshToken);
            }
            
            headers.set("Authorization", `Bearer ${newData.accessToken}`);
            res = await fetch(url, {
              ...options,
              headers,
            });
            return res;
          }
        }
      } catch (err) {
        console.error("Failed to auto-refresh token:", err);
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }

  return res;
}

export async function logoutApiCall(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const refreshToken = localStorage.getItem("refreshToken");

  if (refreshToken) {
    try {
      await fetchWithAuth(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (e) {
      console.error("Logout API call failed:", e);
    }
  }

  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

