/**
 * Student Management API Service
 * Centralized HTTP client communicating with Express backend.
 * Provides error normalization and fallback guidance.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = "ApiError";
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
      credentials: "include",
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
      throw new ApiError(message, response.status, data?.errors || null);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network / connection failure
    console.error(`[API Network Error] ${options.method || "GET"} ${url}:`, error);
    throw new ApiError(
      "Unable to connect to the backend server. Please ensure the server is running on port 5000.",
      0,
      { originalError: error.message }
    );
  }
}

export const studentApi = {
  /**
   * Health check
   */
  async checkHealth() {
    return request("/health");
  },

  /**
   * Fetch all students with optional filters
   */
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.course) query.set("course", params.course);
    if (params.status) query.set("status", params.status);
    if (params.sortBy) query.set("sortBy", params.sortBy);

    const queryString = query.toString();
    const endpoint = queryString ? `/students?${queryString}` : "/students";
    const res = await request(endpoint);
    return res.data || [];
  },

  /**
   * Fetch student statistics
   */
  async getStats() {
    const res = await request("/students/stats");
    return res.data;
  },

  /**
   * Search students by keyword
   */
  async searchStudents(keyword) {
    const res = await request(
      `/students/search?q=${encodeURIComponent(keyword)}`
    );
    return res.data || [];
  },

  /**
   * Fetch a single student by ID
   */
  async getStudentById(id) {
    const res = await request(`/students/${encodeURIComponent(id)}`);
    return res.data;
  },

  /**
   * Create a new student
   */
  async createStudent(studentData) {
    const res = await request("/students", {
      method: "POST",
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  /**
   * Update an existing student
   */
  async updateStudent(id, studentData) {
    const res = await request(`/students/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(studentData),
    });
    return res.data;
  },

  /**
   * Delete a student
   */
  async deleteStudent(id) {
    const res = await request(`/students/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.data;
  },
};

export default studentApi;
