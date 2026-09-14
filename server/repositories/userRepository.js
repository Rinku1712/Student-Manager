import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "../data/users.json");

/**
 * JsonUserRepository
 * Encapsulates persistent storage operations for users in users.json.
 * Follows the Repository pattern for effortless migration to Mongo/Postgres.
 */
class JsonUserRepository {
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
      console.error("Error reading users.json:", error);
      return [];
    }
  }

  async _writeData(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.filePath, content, "utf-8");
      return true;
    } catch (error) {
      console.error("Error writing users.json:", error);
      throw new Error("User storage write failure");
    }
  }

  async getAll() {
    return await this._readData();
  }

  async getById(id) {
    if (!id) return null;
    const users = await this._readData();
    return users.find((u) => String(u.id) === String(id)) || null;
  }

  async findByEmail(email, excludeId = null) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const users = await this._readData();
    return (
      users.find(
        (u) =>
          u.email?.trim().toLowerCase() === normalized &&
          (!excludeId || String(u.id) !== String(excludeId))
      ) || null
    );
  }

  async findByVerificationTokenHash(hash) {
    if (!hash) return null;
    const users = await this._readData();
    return (
      users.find((u) => u.verificationTokenHash && u.verificationTokenHash === hash) ||
      null
    );
  }

  async findByResetTokenHash(hash) {
    if (!hash) return null;
    const users = await this._readData();
    return (
      users.find((u) => u.resetTokenHash && u.resetTokenHash === hash) || null
    );
  }

  async create(user) {
    const users = await this._readData();
    users.unshift(user);
    await this._writeData(users);
    return user;
  }

  async update(id, updatedFields) {
    const users = await this._readData();
    const index = users.findIndex((u) => String(u.id) === String(id));
    if (index === -1) return null;

    const existing = users[index];
    const updated = {
      ...existing,
      ...updatedFields,
      id: existing.id, // preserve immutable ID
      createdAt: existing.createdAt, // preserve creation date
      updatedAt: new Date().toISOString(),
    };

    users[index] = updated;
    await this._writeData(users);
    return updated;
  }

  async delete(id) {
    const users = await this._readData();
    const initialLength = users.length;
    const filtered = users.filter((u) => String(u.id) !== String(id));

    if (filtered.length === initialLength) {
      return false;
    }

    await this._writeData(filtered);
    return true;
  }
}

export const userRepository = new JsonUserRepository();
export default userRepository;
