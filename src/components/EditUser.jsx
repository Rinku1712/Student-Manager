import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import studentApi from "../services/studentApi";

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
const MOBILE_REGEX = /^\d{10}$/;

function EditUser({
  editUser,
  setEditUser,
  setStudents,
  onStudentUpdated,
}) {
  const [draft, setDraft] = useState({
    FirstName: editUser?.FirstName || "",
    LastName: editUser?.LastName || "",
    Email: editUser?.Email || "",
    Mobile: editUser?.Mobile || editUser?.Phone || "",
    Dob: editUser?.Dob || "",
    Status: editUser?.Status || "active",
    Course: editUser?.Course || "",
    Password: editUser?.Password || "",
    id: editUser?.id,
    studentId: editUser?.studentId,
    registrationDate: editUser?.registrationDate,
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSaving) {
        setEditUser(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setEditUser, isSaving]);

  if (!editUser) return null;

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
      case "Mobile":
        if (!value.trim()) return "Mobile number is required";
        if (!MOBILE_REGEX.test(value.trim())) return "Mobile number must be exactly 10 digits";
        return "";
      case "Status":
        if (!value) return "Status is required";
        return "";
      case "Course":
        if (!value) return "Course is required";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "Mobile") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      setDraft((current) => ({ ...current, [name]: cleanValue }));

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, cleanValue),
        }));
      }
      return;
    }

    setDraft((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    ["FirstName", "LastName", "Email", "Mobile", "Status", "Course"].forEach((field) => {
      const err = validateField(field, draft[field] || "");
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (event) => {
    if (event) event.preventDefault();

    if (!validateAll()) {
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        FirstName: draft.FirstName.trim(),
        LastName: draft.LastName.trim(),
        Email: draft.Email.trim().toLowerCase(),
        Mobile: draft.Mobile.trim(),
        Dob: draft.Dob || "",
        Status: draft.Status,
        Course: draft.Course,
        Password: draft.Password,
      };

      const updatedRecord = await studentApi.updateStudent(draft.id, payload);

      setStudents((current) =>
        current.map((student) =>
          student.id === updatedRecord.id ? updatedRecord : student
        )
      );

      if (onStudentUpdated) {
        onStudentUpdated(updatedRecord);
      }

      setEditUser(null);

      await Swal.fire({
        title: "Changes Saved",
        text: `${updatedRecord.FirstName} ${updatedRecord.LastName}'s record was updated successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Update student error:", error);

      if (error.status === 409) {
        await Swal.fire({
          title: "Duplicate Email",
          text: error.message || "A student with this email already exists.",
          icon: "error",
          confirmButtonColor: "#0f766e",
        });
        setErrors((prev) => ({
          ...prev,
          Email: "This email is already registered by another student",
        }));
      } else if (error.status === 400 && error.details) {
        setErrors(error.details);
        await Swal.fire({
          title: "Validation Error",
          text: error.message || "Please correct the highlighted fields.",
          icon: "error",
          confirmButtonColor: "#0f766e",
        });
      } else {
        await Swal.fire({
          title: "Update Failed",
          text: error.message || "Unable to update student. Please check server connection.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => !isSaving && setEditUser(null)}
      aria-hidden="false"
    >
      <section
        className="detail-modal edit-modal animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-student-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-button"
          onClick={() => setEditUser(null)}
          aria-label="Close editor"
          disabled={isSaving}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <p className="eyebrow">Directory Management</p>
        <h2 id="edit-student-title">Edit Student Record</h2>
        <p className="modal-copy">
          Update the student information below and save your changes.
        </p>

        <form onSubmit={handleUpdate} noValidate>
          <div className="form-grid two-columns">
            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-firstName">
                <span>First Name *</span>
                <input
                  id="edit-firstName"
                  name="FirstName"
                  value={draft.FirstName || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className={errors.FirstName ? "input-error" : ""}
                  aria-invalid={Boolean(errors.FirstName)}
                  aria-describedby={errors.FirstName ? "edit-fn-error" : undefined}
                  required
                />
              </label>
              {errors.FirstName && (
                <span id="edit-fn-error" className="field-error-text" role="alert">
                  {errors.FirstName}
                </span>
              )}
            </div>

            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-lastName">
                <span>Last Name *</span>
                <input
                  id="edit-lastName"
                  name="LastName"
                  value={draft.LastName || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className={errors.LastName ? "input-error" : ""}
                  aria-invalid={Boolean(errors.LastName)}
                  aria-describedby={errors.LastName ? "edit-ln-error" : undefined}
                  required
                />
              </label>
              {errors.LastName && (
                <span id="edit-ln-error" className="field-error-text" role="alert">
                  {errors.LastName}
                </span>
              )}
            </div>
          </div>

          <div className="form-grid two-columns">
            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-email">
                <span>Email Address *</span>
                <input
                  id="edit-email"
                  type="email"
                  name="Email"
                  value={draft.Email || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className={errors.Email ? "input-error" : ""}
                  aria-invalid={Boolean(errors.Email)}
                  aria-describedby={errors.Email ? "edit-em-error" : undefined}
                  required
                />
              </label>
              {errors.Email && (
                <span id="edit-em-error" className="field-error-text" role="alert">
                  {errors.Email}
                </span>
              )}
            </div>

            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-mobile">
                <span>Mobile Number (10 digits) *</span>
                <input
                  id="edit-mobile"
                  type="tel"
                  name="Mobile"
                  inputMode="numeric"
                  maxLength={10}
                  value={draft.Mobile || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="e.g. 9876543210"
                  className={errors.Mobile ? "input-error" : ""}
                  aria-invalid={Boolean(errors.Mobile)}
                  aria-describedby={errors.Mobile ? "edit-mb-error" : undefined}
                  required
                />
              </label>
              {errors.Mobile && (
                <span id="edit-mb-error" className="field-error-text" role="alert">
                  {errors.Mobile}
                </span>
              )}
            </div>
          </div>

          <div className="form-grid two-columns">
            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-dob">
                <span>Date of Birth</span>
                <input
                  id="edit-dob"
                  type="date"
                  name="Dob"
                  value={draft.Dob || ""}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
              </label>
            </div>

            <div className="form-field-wrapper">
              <label className="form-field" htmlFor="edit-status">
                <span>Enrollment Status *</span>
                <select
                  id="edit-status"
                  name="Status"
                  value={(draft.Status || "").toLowerCase()}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className={errors.Status ? "input-error" : ""}
                  aria-invalid={Boolean(errors.Status)}
                  aria-describedby={errors.Status ? "edit-st-error" : undefined}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              {errors.Status && (
                <span id="edit-st-error" className="field-error-text" role="alert">
                  {errors.Status}
                </span>
              )}
            </div>
          </div>

          <div className="form-field-wrapper">
            <label className="form-field" htmlFor="edit-course">
              <span>Course *</span>
              <select
                id="edit-course"
                name="Course"
                value={draft.Course || ""}
                onChange={handleInputChange}
                disabled={isSaving}
                className={errors.Course ? "input-error" : ""}
                aria-invalid={Boolean(errors.Course)}
                aria-describedby={errors.Course ? "edit-cs-error" : undefined}
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
              <span id="edit-cs-error" className="field-error-text" role="alert">
                {errors.Course}
              </span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEditUser(null)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSaving}
            >
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default EditUser;
