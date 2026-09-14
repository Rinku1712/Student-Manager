import studentRepository from "../repositories/studentRepository.js";
import { validateStudentInput } from "../utils/validation.js";

class StudentService {
  constructor(repository = studentRepository) {
    this.repository = repository;
  }

  async _generateStudentId() {
    const year = new Date().getFullYear();
    const students = await this.repository.getAll();
    let nextNum = students.length + 1;
    let candidate = `STU-${year}-${String(nextNum).padStart(4, "0")}`;

    const existingIds = new Set(
      students.map((s) => String(s.id || s.studentId))
    );

    while (existingIds.has(candidate)) {
      nextNum++;
      candidate = `STU-${year}-${String(nextNum).padStart(4, "0")}`;
    }
    return candidate;
  }

  async getAllStudents(query = {}) {
    let students = await this.repository.getAll();

    // Filtering
    if (query.status) {
      const statusFilter = query.status.trim().toLowerCase();
      students = students.filter(
        (s) => (s.Status || "").toLowerCase() === statusFilter
      );
    }

    if (query.course) {
      const courseFilter = query.course.trim().toLowerCase();
      students = students.filter(
        (s) => (s.Course || "").trim().toLowerCase() === courseFilter
      );
    }

    // Sorting
    if (query.sort) {
      const sortType = query.sort.trim().toLowerCase();
      students.sort((a, b) => {
        if (sortType === "name-asc") {
          const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.trim().toLowerCase();
          const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.trim().toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortType === "name-desc") {
          const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.trim().toLowerCase();
          const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.trim().toLowerCase();
          return nameB.localeCompare(nameA);
        }
        if (sortType === "oldest") {
          return new Date(a.registrationDate || 0) - new Date(b.registrationDate || 0);
        }
        // Default newest
        return new Date(b.registrationDate || 0) - new Date(a.registrationDate || 0);
      });
    }

    return students;
  }

  async getStudentById(id) {
    const student = await this.repository.getById(id);
    if (!student) {
      const error = new Error(`Student with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  async searchStudents(searchTerm) {
    if (!searchTerm || !searchTerm.trim()) {
      return await this.repository.getAll();
    }

    const term = searchTerm.trim().toLowerCase();
    const all = await this.repository.getAll();

    return all.filter((student) => {
      const fn = student.FirstName || "";
      const ln = student.LastName || "";
      const em = student.Email || "";
      const mb = student.Mobile || student.Phone || "";
      const cs = student.Course || "";
      const id = String(student.id || "");

      return (
        fn.toLowerCase().includes(term) ||
        ln.toLowerCase().includes(term) ||
        em.toLowerCase().includes(term) ||
        mb.includes(term) ||
        cs.toLowerCase().includes(term) ||
        id.toLowerCase().includes(term)
      );
    });
  }

  async getStats() {
    const students = await this.repository.getAll();
    const total = students.length;
    const active = students.filter(
      (s) => (s.Status || "").toLowerCase() === "active"
    ).length;
    const inactive = students.filter(
      (s) => (s.Status || "").toLowerCase() === "inactive"
    ).length;
    const courses = new Set(
      students.map((s) => s.Course?.trim()).filter(Boolean)
    ).size;

    return {
      total,
      active,
      inactive,
      courses,
    };
  }

  async createStudent(inputData) {
    const validation = validateStudentInput(inputData, false);
    if (!validation.isValid) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validation.errors;
      throw error;
    }

    const { sanitized } = validation;

    // Check duplicate email
    const duplicate = await this.repository.findByEmail(sanitized.Email);
    if (duplicate) {
      const error = new Error("A student with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const studentId = await this._generateStudentId();
    const newStudent = {
      ...sanitized,
      id: studentId,
      studentId: studentId,
      registrationDate: new Date().toISOString(),
    };

    return await this.repository.create(newStudent);
  }

  async updateStudent(id, inputData) {
    // Ensure student exists
    const existing = await this.repository.getById(id);
    if (!existing) {
      const error = new Error(`Student with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const validation = validateStudentInput(inputData, true);
    if (!validation.isValid) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = validation.errors;
      throw error;
    }

    const { sanitized } = validation;

    // Check duplicate email if changed
    if (sanitized.Email && sanitized.Email !== existing.Email?.toLowerCase()) {
      const duplicate = await this.repository.findByEmail(sanitized.Email, id);
      if (duplicate) {
        const error = new Error("A student with this email already exists.");
        error.statusCode = 409;
        throw error;
      }
    }

    return await this.repository.update(id, sanitized);
  }

  async deleteStudent(id) {
    const existing = await this.repository.getById(id);
    if (!existing) {
      const error = new Error(`Student with ID ${id} not found.`);
      error.statusCode = 404;
      throw error;
    }

    await this.repository.delete(id);
    return { id, deleted: true, student: existing };
  }
}

export const studentService = new StudentService();
export default studentService;
