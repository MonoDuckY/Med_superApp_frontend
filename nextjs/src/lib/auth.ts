export interface LoginResponseData {
  accessToken: string;
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
