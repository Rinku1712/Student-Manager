const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\d{10}$/;

export const VALID_COURSES = [
  "BCA",
  "B-Tech",
  "B.COM",
  "BBA",
  "BA",
  "B.SC",
  "B.Phar",
];

export const VALID_STATUSES = ["active", "inactive"];

/**
 * Validates student input fields.
 * Required: FirstName, LastName, Email, Mobile, Course, Status
 * Mobile must contain exactly 10 numeric digits.
 */
export function validateStudentInput(data = {}, isUpdate = false) {
  const errors = {};

  // First Name
  if (!isUpdate || data.FirstName !== undefined) {
    if (!data.FirstName || typeof data.FirstName !== "string" || !data.FirstName.trim()) {
      errors.FirstName = "First name is required.";
    } else if (data.FirstName.trim().length < 2) {
      errors.FirstName = "First name must be at least 2 characters.";
    }
  }

  // Last Name
  if (!isUpdate || data.LastName !== undefined) {
    if (!data.LastName || typeof data.LastName !== "string" || !data.LastName.trim()) {
      errors.LastName = "Last name is required.";
    }
  }

  // Email
  if (!isUpdate || data.Email !== undefined) {
    if (!data.Email || typeof data.Email !== "string" || !data.Email.trim()) {
      errors.Email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(data.Email.trim())) {
      errors.Email = "Please provide a valid email address.";
    }
  }

  // Mobile (10 digits only)
  // Accept 'Mobile' or 'Phone' for backward compatibility
  const mobileVal = data.Mobile !== undefined ? data.Mobile : data.Phone;
  if (!isUpdate || mobileVal !== undefined) {
    if (mobileVal === undefined || mobileVal === null || String(mobileVal).trim() === "") {
      errors.Mobile = "Mobile number is required.";
    } else {
      const cleanedMobile = String(mobileVal).trim();
      if (!MOBILE_REGEX.test(cleanedMobile)) {
        errors.Mobile = "Mobile number must be exactly 10 digits and contain numbers only.";
      }
    }
  }

  // Course
  if (!isUpdate || data.Course !== undefined) {
    if (!data.Course || typeof data.Course !== "string" || !data.Course.trim()) {
      errors.Course = "Course is required.";
    }
  }

  // Status
  if (!isUpdate || data.Status !== undefined) {
    if (!data.Status || typeof data.Status !== "string" || !VALID_STATUSES.includes(data.Status.trim().toLowerCase())) {
      errors.Status = "Status must be either 'active' or 'inactive'.";
    }
  }

  const isValid = Object.keys(errors).length === 0;

  const sanitized = {
    ...(data.FirstName !== undefined && { FirstName: String(data.FirstName).trim() }),
    ...(data.LastName !== undefined && { LastName: String(data.LastName).trim() }),
    ...(data.Email !== undefined && { Email: String(data.Email).trim().toLowerCase() }),
    ...(mobileVal !== undefined && { Mobile: String(mobileVal).trim() }),
    ...(data.Course !== undefined && { Course: String(data.Course).trim() }),
    ...(data.Status !== undefined && { Status: String(data.Status).trim().toLowerCase() }),
    ...(data.Dob !== undefined && { Dob: String(data.Dob).trim() }),
  };

  return {
    isValid,
    errors,
    sanitized,
  };
}
