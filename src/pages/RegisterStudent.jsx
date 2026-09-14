import { useState } from "react";
import Swal from "sweetalert2";

const COURSES = [
  "BCA",
  "B-Tech",
  "B.COM",
  "BBA",
  "BA",
  "B.SC",
  "B.Phar",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  FirstName: "",
  LastName: "",
  Email: "",
  Phone: "",
  Password: "",
  Dob: "",
  Status: "active",
  Course: "",
};

function generateStudentId(existingStudents = []) {
  const year = new Date().getFullYear();
  let nextNum = existingStudents.length + 1;
  let candidate = `STU-${year}-${String(nextNum).padStart(4, "0")}`;

  while (
    existingStudents.some(
      (s) => s.studentId === candidate || s.id === candidate
    )
  ) {
    nextNum++;
    candidate = `STU-${year}-${String(nextNum).padStart(4, "0")}`;
  }
  return candidate;
}

function RegisterStudent({ addStudent, existingStudents = [], onNavigate }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = Boolean(
    formData.FirstName?.trim() ||
    formData.LastName?.trim() ||
    formData.Email?.trim() ||
    formData.Phone?.trim() ||
    formData.Dob ||
    formData.Course ||
    formData.Password
  );

  const validateField = (name, value) => {
    switch (name) {
      case "FirstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "Must be at least 2 characters";
        return "";
      case "LastName":
        if (!value.trim()) return "Last name is required";
        return "";
      case "Email":
        if (!value.trim()) return "Email address is required";
        if (!EMAIL_REGEX.test(value.trim())) return "Enter a valid email address";
        return "";
      case "Status":
        if (!value) return "Enrollment status is required";
        return "";
      case "Course":
        if (!value) return "Course is required";
        return "";
      case "Password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(initialForm).forEach((key) => {
      if (key === "Dob" || key === "Phone") return;
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateAll()) {
      return;
    }

    const trimmedEmail = formData.Email.trim().toLowerCase();

    // Duplicate email check
    const emailExists = existingStudents.some(
      (s) => s.Email?.trim().toLowerCase() === trimmedEmail
    );

    if (emailExists) {
      await Swal.fire({
        title: "Duplicate Student",
        text: "Student with this email already exists in the directory.",
        icon: "error",
        confirmButtonColor: "#0f766e",
      });
      setErrors((prev) => ({
        ...prev,
        Email: "This email is already registered",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await Swal.fire({
        title: "Register Student?",
        html: `Register <strong>${formData.FirstName.trim()} ${formData.LastName.trim()}</strong> into the student directory?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Register Student",
        cancelButtonText: "Review Details",
        confirmButtonColor: "#0f766e",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        setIsSubmitting(false);
        return;
      }

      const generatedId = generateStudentId(existingStudents);

      const newStudent = {
        FirstName: formData.FirstName.trim(),
        LastName: formData.LastName.trim(),
        Email: trimmedEmail,
        Phone: formData.Phone ? formData.Phone.trim() : "",
        Dob: formData.Dob || "",
        Password: formData.Password,
        Status: formData.Status,
        Course: formData.Course,
        studentId: generatedId,
        id: Date.now() + Math.floor(Math.random() * 1000),
        registrationDate: new Date().toISOString(),
      };

      addStudent(newStudent);
      setFormData(initialForm);
      setErrors({});

      await Swal.fire({
        title: "Student Registered Successfully",
        text: `${newStudent.FirstName} ${newStudent.LastName} has been added with ID: ${generatedId}.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      onNavigate("students");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: "Discard Registration?",
        text: "You have unsaved information. Are you sure you want to discard your changes and leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Discard",
        cancelButtonText: "Continue Editing",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#64748b",
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    onNavigate("students");
  };

  return (
    <div className="registration-page animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header-row">
        <button
          type="button"
          className="back-link-btn"
          onClick={handleCancel}
          aria-label="Back to students list"
        >
          ← Back to Students
        </button>

        <div className="page-header-title">
          <p className="eyebrow">Academic Directory</p>
          <h2>Student Registration</h2>
          <p className="muted-copy">
            Add a new student to your academic directory. All required fields are marked with an asterisk (*).
          </p>
        </div>
      </div>

      {/* Registration Form Card */}
      <div className="form-card-container">
        <form onSubmit={handleSubmit} noValidate className="registration-form">
          {/* Section 1: Personal Information */}
          <fieldset className="form-section animate-fade-in-up" style={{ animationDelay: "60ms" }}>
            <legend className="section-legend">
              <span className="legend-badge">1</span>
              <span>Personal Information</span>
            </legend>

            <div className="form-grid two-columns">
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-firstName">
                  <span>First Name *</span>
                  <input
                    id="reg-firstName"
                    name="FirstName"
                    value={formData.FirstName}
                    onChange={handleChange}
                    placeholder="e.g. Aisha"
                    className={errors.FirstName ? "input-error" : ""}
                    aria-invalid={Boolean(errors.FirstName)}
                    aria-describedby={errors.FirstName ? "reg-fn-err" : undefined}
                    required
                  />
                </label>
                {errors.FirstName && (
                  <span id="reg-fn-err" className="field-error-text" role="alert">
                    {errors.FirstName}
                  </span>
                )}
              </div>

              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-lastName">
                  <span>Last Name *</span>
                  <input
                    id="reg-lastName"
                    name="LastName"
                    value={formData.LastName}
                    onChange={handleChange}
                    placeholder="e.g. Khan"
                    className={errors.LastName ? "input-error" : ""}
                    aria-invalid={Boolean(errors.LastName)}
                    aria-describedby={errors.LastName ? "reg-ln-err" : undefined}
                    required
                  />
                </label>
                {errors.LastName && (
                  <span id="reg-ln-err" className="field-error-text" role="alert">
                    {errors.LastName}
                  </span>
                )}
              </div>
            </div>

            <div className="form-grid two-columns">
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-dob">
                  <span>Date of Birth</span>
                  <input
                    id="reg-dob"
                    type="date"
                    name="Dob"
                    value={formData.Dob}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-password">
                  <span>Temporary Password *</span>
                  <input
                    id="reg-password"
                    type="password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className={errors.Password ? "input-error" : ""}
                    aria-invalid={Boolean(errors.Password)}
                    aria-describedby={errors.Password ? "reg-pwd-err" : undefined}
                    required
                  />
                </label>
                {errors.Password && (
                  <span id="reg-pwd-err" className="field-error-text" role="alert">
                    {errors.Password}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Section 2: Contact Information */}
          <fieldset className="form-section animate-fade-in-up" style={{ animationDelay: "120ms" }}>
            <legend className="section-legend">
              <span className="legend-badge">2</span>
              <span>Contact Information</span>
            </legend>

            <div className="form-grid two-columns">
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-email">
                  <span>Email Address *</span>
                  <input
                    id="reg-email"
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className={errors.Email ? "input-error" : ""}
                    aria-invalid={Boolean(errors.Email)}
                    aria-describedby={errors.Email ? "reg-em-err" : undefined}
                    required
                  />
                </label>
                {errors.Email && (
                  <span id="reg-em-err" className="field-error-text" role="alert">
                    {errors.Email}
                  </span>
                )}
              </div>

              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-phone">
                  <span>Phone Number</span>
                  <input
                    id="reg-phone"
                    type="tel"
                    name="Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </label>
              </div>
            </div>
          </fieldset>

          {/* Section 3: Academic Information */}
          <fieldset className="form-section animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <legend className="section-legend">
              <span className="legend-badge">3</span>
              <span>Academic Information</span>
            </legend>

            <div className="form-grid two-columns">
              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-course">
                  <span>Course *</span>
                  <select
                    id="reg-course"
                    name="Course"
                    value={formData.Course}
                    onChange={handleChange}
                    className={errors.Course ? "input-error" : ""}
                    aria-invalid={Boolean(errors.Course)}
                    aria-describedby={errors.Course ? "reg-cs-err" : undefined}
                    required
                  >
                    <option value="">Select Course</option>
                    {COURSES.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </label>
                {errors.Course && (
                  <span id="reg-cs-err" className="field-error-text" role="alert">
                    {errors.Course}
                  </span>
                )}
              </div>

              <div className="form-field-wrapper">
                <label className="form-field" htmlFor="reg-status">
                  <span>Enrollment Status *</span>
                  <select
                    id="reg-status"
                    name="Status"
                    value={formData.Status}
                    onChange={handleChange}
                    className={errors.Status ? "input-error" : ""}
                    aria-invalid={Boolean(errors.Status)}
                    aria-describedby={errors.Status ? "reg-st-err" : undefined}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
                {errors.Status && (
                  <span id="reg-st-err" className="field-error-text" role="alert">
                    {errors.Status}
                  </span>
                )}
              </div>
            </div>
          </fieldset>

          {/* Form Actions */}
          <div className="registration-actions">
            <button
              type="button"
              className="secondary-button form-cancel-btn"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button form-submit-btn"
              disabled={isSubmitting}
            >
              <span aria-hidden="true">+</span> Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterStudent;
