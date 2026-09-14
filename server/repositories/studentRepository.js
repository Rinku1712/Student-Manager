import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/students.json");

/**
 * JsonStudentRepository
 * Encapsulates all persistent storage operations for students in JSON file.
 * This class adheres to the Repository pattern, making it straightforward
 * to substitute with MongoStudentRepository or PostgresStudentRepository later.
 */
class JsonStudentRepository {
  constructor(filePath = DATA_FILE) {
    this.filePath = filePath;
    this._ensureFileExists();
  }

  async _ensureFileExists() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2), "utf-8");
    }
  }

  async _readData() {
    try {
      const content = await fs.readFile(this.filePath, "utf-8");
      if (!content || !content.trim()) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error reading JSON database:", error);
      return [];
    }
  }

  async _writeData(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.filePath, content, "utf-8");
      return true;
    } catch (error) {
      console.error("Error writing JSON database:", error);
      throw new Error("Storage write failure");
    }
  }

  async getAll() {
    return await this._readData();
  }

  async getById(id) {
    const students = await this._readData();
    return students.find((s) => String(s.id) === String(id)) || null;
  }

  async findByEmail(email, excludeId = null) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const students = await this._readData();
    return (
      students.find(
        (s) =>
          s.Email?.trim().toLowerCase() === normalized &&
          (!excludeId || String(s.id) !== String(excludeId))
      ) || null
    );
  }

  async create(student) {
    const students = await this._readData();
    students.unshift(student); // newest first
    await this._writeData(students);
    return student;
  }

  async update(id, updatedFields) {
    const students = await this._readData();
    const index = students.findIndex((s) => String(s.id) === String(id));
    if (index === -1) return null;

    const existing = students[index];
    const updated = {
      ...existing,
      ...updatedFields,
      id: existing.id, // preserve immutable ID
      registrationDate: existing.registrationDate, // preserve registration date
    };

    students[index] = updated;
    await this._writeData(students);
    return updated;
  }

  async delete(id) {
    const students = await this._readData();
    const initialLength = students.length;
    const filtered = students.filter((s) => String(s.id) !== String(id));

    if (filtered.length === initialLength) {
      return false;
    }

    await this._writeData(filtered);
    return true;
  }
}

export const studentRepository = new JsonStudentRepository();
export default studentRepository;
