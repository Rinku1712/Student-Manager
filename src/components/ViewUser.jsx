import { useEffect } from "react";
import { formatStudentId, formatRegistrationDate, getInitials } from "../utils/studentUtils";

function ViewUser({ selectedUser, onClose, onEdit }) {
  useEffect(() => {
    if (!selectedUser) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUser, onClose]);

  if (!selectedUser) return null;

  const firstName = selectedUser.FirstName?.trim() || "Unknown";
  const lastName = selectedUser.LastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = getInitials(firstName, lastName);
  const status = (selectedUser.Status || "pending").toLowerCase();
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const studentId = formatStudentId(selectedUser);
  const regDate = formatRegistrationDate(
    selectedUser.registrationDate || selectedUser.id
  );

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
      aria-hidden="false"
    >
      <section
        className="detail-modal animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close details"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div className="modal-profile">
          <span className="large-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="modal-profile-info">
            <p className="eyebrow">Student Profile</p>
            <h2 id="student-details-title">{fullName}</h2>
            <div className="profile-badge-row">
              <span className={`status-pill status-${status}`}>
                <span className="status-indicator" aria-hidden="true" />
                {statusLabel}
              </span>
              <span className="id-badge">{studentId}</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div>
            <span>Student ID</span>
            <strong>{studentId}</strong>
          </div>
          <div>
            <span>Registration Date</span>
            <strong>{regDate}</strong>
          </div>
          <div>
            <span>Email Address</span>
            <strong>{selectedUser.Email || "No email provided"}</strong>
          </div>
          <div>
            <span>Phone Number</span>
            <strong>{selectedUser.Phone || "Not provided"}</strong>
          </div>
          <div>
            <span>Enrolled Course</span>
            <strong>{selectedUser.Course || "Not assigned"}</strong>
          </div>
          <div>
            <span>Date of Birth</span>
            <strong>{selectedUser.Dob || "Not provided"}</strong>
          </div>
        </div>

        <div className="modal-actions">
          {onEdit && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                onClose();
                onEdit(selectedUser);
              }}
            >
              <span aria-hidden="true">✎</span> Edit Record
            </button>
          )}
          <button
            type="button"
            className="primary-button modal-close-btn"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

export default ViewUser;
