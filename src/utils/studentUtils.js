export function getInitials(firstName = "", lastName = "") {
  const f = firstName?.trim() ? firstName.trim().charAt(0).toUpperCase() : "";
  const l = lastName?.trim() ? lastName.trim().charAt(0).toUpperCase() : "";
  return `${f}${l}` || "ST";
}

export function formatStudentId(student) {
  if (!student) return "";
  if (student.studentId) return student.studentId;
  if (typeof student.id === "string" && student.id.startsWith("STU-")) {
    return student.id;
  }
  const idStr = String(student.id || "");
  return `STU-${idStr.slice(-4) || "0001"}`;
}

export function formatRegistrationDate(dateVal) {
  if (!dateVal) return "Legacy Record";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "Registered";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "Registered";
  }
}
