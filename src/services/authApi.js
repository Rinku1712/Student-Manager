/**
 * Authentication API Service
 * Centralized HTTP client communicating with /api/auth endpoints.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class AuthApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      credentials: "include", // transmit & receive HTTP-only cookies
      ...options,
      headers,
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const message =
        data?.message ||
        `Request failed with status ${response.status}: ${response.statusText}`;
      throw new AuthApiError(message, response.status, data?.errors || data || null);
    }

    return data;
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    console.error(`[Auth API Network Error] ${options.method || "GET"} ${url}:`, error);
    throw new AuthApiError(
      "Unable to connect to authentication server. Please check your network or server status.",
      0,
      { originalError: error.message }
    );
  }
}

export const authApi = {
  async signup(userData) {
    const res = await request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return res;
  },

  async login(credentials) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    return res;
  },

  async logout() {
    const res = await request("/auth/logout", {
      method: "POST",
    });
    return res;
  },

  async getMe() {
    const res = await request("/auth/me");
    return res.data;
  },

  async verifyEmail(token) {
    const res = await request(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return res;
  },

  async resendVerification(email) {
    const res = await request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async forgotPassword(email) {
    const res = await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return res;
  },

  async resetPassword({ token, newPassword, confirmPassword }) {
    const res = await request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
    return res;
  },

  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    const res = await request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    return res;
  },

  async updateProfile(profileData) {
    const res = await request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    return res;
  },
};

export default authApi;
