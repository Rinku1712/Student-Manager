import { getInitials, formatStudentId, formatRegistrationDate } from "../utils/studentUtils";

function StudentTable({ students = [], onView, onEdit, onDelete }) {
  return (
    <div className="table-wrap" tabIndex="0" role="region" aria-label="Student records table">
      <table>
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Contact</th>
            <th scope="col">Course</th>
            <th scope="col">Status</th>
            <th scope="col">Registered</th>
            <th scope="col" className="actions-heading">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const initials = getInitials(student.FirstName, student.LastName);
            const fullName =
              `${student.FirstName || ""} ${student.LastName || ""}`.trim() ||
              "Unnamed Student";
            const status = (student.Status || "pending").toLowerCase();
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
            const studentId = formatStudentId(student);
            const regDate = formatRegistrationDate(
              student.registrationDate || student.id
            );

            return (
              <tr
                key={student.id}
                className="table-row-animate"
                style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
              >
                <td>
                  <div className="student-cell">
                    <span className="avatar" aria-hidden="true">
                      {initials}
                    </span>
                    <div className="student-cell-info">
                      <strong>{fullName}</strong>
                      <small className="student-id-tag">{studentId}</small>
                    </div>
                  </div>
                </td>
                <td className="email-cell">
                  <div className="contact-cell-content">
                    <span className="contact-email" title={student.Email}>
                      {student.Email || "No email"}
                    </span>
                    {student.Phone && (
                      <span className="contact-phone" title={student.Phone}>
                        📞 {student.Phone}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="course-pill">
                    {student.Course || "Unassigned"}
                  </span>
                </td>
                <td>
                  <span className={`status-pill status-${status}`}>
                    <span className="status-indicator" aria-hidden="true" />
                    {statusLabel}
                  </span>
                </td>
                <td className="date-cell">
                  <span>{regDate}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="action-button action-view"
                      onClick={() => onView(student)}
                      aria-label={`View details for ${fullName}`}
                      title="View details"
                    >
                      <span aria-hidden="true">👁</span> View
                    </button>
                    <button
                      type="button"
                      className="action-button action-edit"
                      onClick={() => onEdit(student)}
                      aria-label={`Edit ${fullName}`}
                      title="Edit student"
                    >
                      <span aria-hidden="true">✎</span> Edit
                    </button>
                    <button
                      type="button"
                      className="action-button action-delete"
                      onClick={() => onDelete(student)}
                      aria-label={`Delete ${fullName}`}
                      title="Delete student"
                    >
                      <span aria-hidden="true">🗑</span> Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
