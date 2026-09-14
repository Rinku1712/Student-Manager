import { formatStudentId, formatRegistrationDate } from "./studentUtils";

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportStudentsToCSV(students = []) {
  if (!students.length) return false;

  const headers = [
    "Student ID",
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Course",
    "Status",
    "Date of Birth",
    "Registration Date",
  ];

  const rows = students.map((s) => [
    escapeCSV(formatStudentId(s)),
    escapeCSV(s.FirstName || ""),
    escapeCSV(s.LastName || ""),
    escapeCSV(s.Email || ""),
    escapeCSV(s.Phone || ""),
    escapeCSV(s.Course || "Unassigned"),
    escapeCSV(s.Status || "pending"),
    escapeCSV(s.Dob || ""),
    escapeCSV(formatRegistrationDate(s.registrationDate || s.id)),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `students_export_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function exportStudentsToJSON(students = []) {
  if (!students.length) return false;

  const jsonContent = JSON.stringify(students, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `students_backup_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function parseAndValidateImport(file, existingStudents = []) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target.result);
        if (!Array.isArray(raw)) {
          resolve({
            success: false,
            error: "The imported file must contain a JSON array of student records.",
          });
          return;
        }

        const validNewStudents = [];
        let duplicateCount = 0;
        let invalidCount = 0;

        const existingEmails = new Set(
          existingStudents.map((s) => s.Email?.trim().toLowerCase()).filter(Boolean)
        );

        raw.forEach((item, index) => {
          if (!item || typeof item !== "object") {
            invalidCount++;
            return;
          }

          const fn = String(item.FirstName || "").trim();
          const ln = String(item.LastName || "").trim();
          const em = String(item.Email || "").trim().toLowerCase();

          if (!fn || !ln || !em || !em.includes("@")) {
            invalidCount++;
            return;
          }

          if (existingEmails.has(em)) {
            duplicateCount++;
            return;
          }

          existingEmails.add(em);

          const studentId =
            item.studentId ||
            (typeof item.id === "string" && item.id.startsWith("STU-")
              ? item.id
              : `STU-2026-${String(existingStudents.length + validNewStudents.length + 1).padStart(4, "0")}`);

          validNewStudents.push({
            FirstName: fn,
            LastName: ln,
            Email: em,
            Phone: item.Phone ? String(item.Phone).trim() : "",
            Dob: item.Dob ? String(item.Dob) : "",
            Course: item.Course ? String(item.Course) : "BCA",
            Status: item.Status ? String(item.Status).toLowerCase() : "active",
            Password: item.Password || "ImportedUser123",
            studentId,
            id: Date.now() + index + Math.floor(Math.random() * 1000),
            registrationDate: item.registrationDate || new Date().toISOString(),
          });
        });

        resolve({
          success: true,
          validNewStudents,
          duplicateCount,
          invalidCount,
          totalParsed: raw.length,
        });
      } catch (err) {
        resolve({
          success: false,
          error: "Invalid JSON format: " + err.message,
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file." });
    };

    reader.readAsText(file);
  });
}
