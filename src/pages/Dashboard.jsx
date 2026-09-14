import StatsCards from "../components/StatsCards";
import { getInitials, formatStudentId, formatRegistrationDate } from "../utils/studentUtils";
import { exportStudentsToCSV } from "../utils/exportImport";

const COURSES = [
  "BCA",
  "B-Tech",
  "B.COM",
  "BBA",
  "BA",
  "B.SC",
  "B.Phar",
];

function Dashboard({ students = [], onNavigate, onView, onEdit, onDelete }) {
  const activeCount = students.filter(
    (s) => (s?.Status || "").toLowerCase() === "active"
  ).length;

  const inactiveCount = students.filter(
    (s) => (s?.Status || "").toLowerCase() === "inactive"
  ).length;

  const courseCount = new Set(
    students.map((s) => s?.Course?.trim()).filter(Boolean)
  ).size;

  // Most recent 5 students (sorted newest first)
  const recentStudents = [...students]
    .sort((a, b) => {
      const dateA = new Date(a.registrationDate || a.id).getTime() || 0;
      const dateB = new Date(b.registrationDate || b.id).getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Course distribution breakdown
  const courseDistribution = COURSES.map((course) => {
    const count = students.filter((s) => s.Course === course).length;
    return {
      course,
      count,
      percentage: students.length > 0 ? Math.round((count / students.length) * 100) : 0,
    };
  }).filter((item) => item.count > 0);

  const handleQuickExport = () => {
    exportStudentsToCSV(students);
  };

  return (
    <div className="dashboard-page animate-fade-in-up">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <p className="eyebrow">Overview</p>
          <h2>Keep your student records organized.</h2>
          <p className="muted-copy">
            Welcome to the administration dashboard. Monitor enrollment metrics, review recent admissions, and manage your directory from one place.
          </p>
        </div>

        <div className="banner-actions">
          <button
            type="button"
            className="primary-button add-student-prominent-btn"
            onClick={() => onNavigate("register")}
          >
            <span aria-hidden="true">+</span> Register Student
          </button>
        </div>
      </section>

      {/* Statistics Cards */}
      <StatsCards
        totalStudents={students.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        courseCount={courseCount}
      />

      {/* Dashboard Grid */}
      <div className="dashboard-sections-grid">
        {/* Recent Registrations Card */}
        <section className="dashboard-card recent-students-panel" aria-labelledby="recent-heading">
          <div className="card-header">
            <div>
              <p className="eyebrow">Admissions</p>
              <h3 id="recent-heading">Recent Registrations</h3>
            </div>
            {students.length > 0 && (
              <button
                type="button"
                className="view-all-link-btn"
                onClick={() => onNavigate("students")}
              >
                View all ({students.length}) →
              </button>
            )}
          </div>

          {recentStudents.length === 0 ? (
            <div className="empty-state dashboard-empty">
              <div className="empty-icon" aria-hidden="true">📝</div>
              <h4>No registered students yet</h4>
              <p>Get started by adding the first student to your directory.</p>
              <button
                type="button"
                className="primary-button"
                onClick={() => onNavigate("register")}
              >
                + Register First Student
              </button>
            </div>
          ) : (
            <div className="recent-list">
              {recentStudents.map((student, index) => {
                const initials = getInitials(student.FirstName, student.LastName);
                const fullName =
                  `${student.FirstName || ""} ${student.LastName || ""}`.trim() ||
                  "Unnamed Student";
                const studentId = formatStudentId(student);
                const status = (student.Status || "pending").toLowerCase();
                const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                const regDate = formatRegistrationDate(
                  student.registrationDate || student.id
                );

                return (
                  <div
                    key={student.id}
                    className="recent-student-item animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="recent-student-left">
                      <span className="avatar" aria-hidden="true">
                        {initials}
                      </span>
                      <div className="recent-student-info">
                        <strong>{fullName}</strong>
                        <div className="recent-meta-row">
                          <span className="student-id-tag">{studentId}</span>
                          <span className="course-pill">{student.Course || "Unassigned"}</span>
                          <span className="reg-date-text">{regDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="recent-student-right">
                      <span className={`status-pill status-${status}`}>
                        <span className="status-indicator" aria-hidden="true" />
                        {statusLabel}
                      </span>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="action-button action-view"
                          onClick={() => onView(student)}
                          aria-label={`View details for ${fullName}`}
                          title="View student"
                        >
                          👁
                        </button>
                        <button
                          type="button"
                          className="action-button action-edit"
                          onClick={() => onEdit(student)}
                          aria-label={`Edit ${fullName}`}
                          title="Edit student"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          className="action-button action-delete"
                          onClick={() => onDelete(student)}
                          aria-label={`Delete ${fullName}`}
                          title="Delete student"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Sidebar: Quick Actions & Course Distribution */}
        <div className="dashboard-sidebar">
          {/* Quick Actions Card */}
          <section className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="quick-actions-list">
              <button
                type="button"
                className="quick-action-item primary-quick-action"
                onClick={() => onNavigate("register")}
              >
                <span className="quick-action-icon" aria-hidden="true">➕</span>
                <div>
                  <strong>Register New Student</strong>
                  <small>Add a new record to directory</small>
                </div>
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate("students")}
              >
                <span className="quick-action-icon" aria-hidden="true">📋</span>
                <div>
                  <strong>Browse Directory</strong>
                  <small>Search, sort and filter all records</small>
                </div>
              </button>

              {students.length > 0 && (
                <button
                  type="button"
                  className="quick-action-item"
                  onClick={handleQuickExport}
                >
                  <span className="quick-action-icon" aria-hidden="true">📊</span>
                  <div>
                    <strong>Export CSV Backup</strong>
                    <small>Download spreadsheet-ready backup</small>
                  </div>
                </button>
              )}

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate("settings")}
              >
                <span className="quick-action-icon" aria-hidden="true">⚙️</span>
                <div>
                  <strong>System Settings</strong>
                  <small>Manage themes, imports and backups</small>
                </div>
              </button>
            </div>
          </section>

          {/* Academic Programs Breakdown */}
          <section className="dashboard-card course-breakdown-card">
            <div className="card-header">
              <h3 className="card-title">Program Representation</h3>
              <span className="badge-count">{courseCount} Courses</span>
            </div>

            {courseDistribution.length === 0 ? (
              <p className="empty-subtext">No course enrollments recorded yet.</p>
            ) : (
              <div className="course-distribution-list">
                {courseDistribution.map((item) => (
                  <div key={item.course} className="course-dist-item">
                    <div className="course-dist-labels">
                      <span className="course-name">{item.course}</span>
                      <span className="course-stats">
                        {item.count} {item.count === 1 ? "student" : "students"} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${item.percentage}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
