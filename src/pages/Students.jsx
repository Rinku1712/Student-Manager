import { useState, useMemo } from "react";
import StudentTable from "../components/StudentTable";
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

function Students({ students = [], onNavigate, onView, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedStudents = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    // 1. Filter
    const filtered = students.filter((student) => {
      if (!student || typeof student !== "object") return false;

      const fn = student.FirstName || "";
      const ln = student.LastName || "";
      const em = student.Email || "";
      const sid = student.studentId || "";
      const ph = student.Phone || "";

      const matchesSearch =
        !normalizedTerm ||
        fn.toLowerCase().includes(normalizedTerm) ||
        ln.toLowerCase().includes(normalizedTerm) ||
        em.toLowerCase().includes(normalizedTerm) ||
        sid.toLowerCase().includes(normalizedTerm) ||
        ph.toLowerCase().includes(normalizedTerm);

      const status = (student.Status || "").toLowerCase();
      const matchesStatus =
        !statusFilter || status === statusFilter.toLowerCase();

      const course = (student.Course || "").trim();
      const matchesCourse = !courseFilter || course === courseFilter;

      return matchesSearch && matchesStatus && matchesCourse;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === "name-asc") {
        const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.trim().toLowerCase();
        const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "name-desc") {
        const nameA = `${a.FirstName || ""} ${a.LastName || ""}`.trim().toLowerCase();
        const nameB = `${b.FirstName || ""} ${b.LastName || ""}`.trim().toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortBy === "oldest") {
        const dateA = new Date(a.registrationDate || a.id).getTime() || 0;
        const dateB = new Date(b.registrationDate || b.id).getTime() || 0;
        return dateA - dateB;
      }
      // Default: newest first
      const dateA = new Date(a.registrationDate || a.id).getTime() || 0;
      const dateB = new Date(b.registrationDate || b.id).getTime() || 0;
      return dateB - dateA;
    });
  }, [students, searchTerm, statusFilter, courseFilter, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCourseFilter("");
    setSortBy("newest");
  };

  const handleExport = () => {
    exportStudentsToCSV(filteredAndSortedStudents);
  };

  const isFiltering = Boolean(
    searchTerm || statusFilter || courseFilter || sortBy !== "newest"
  );

  return (
    <div className="students-page animate-fade-in-up">
      {/* Page Header */}
      <div className="directory-header-row">
        <div>
          <p className="eyebrow">Academic Records</p>
          <h2>Student Directory</h2>
          <p className="muted-copy">
            Browse, search, sort, and manage all enrolled students in your academic directory.
          </p>
        </div>

        <div className="directory-header-actions">
          {students.length > 0 && (
            <button
              type="button"
              className="secondary-button export-csv-btn"
              onClick={handleExport}
              title="Download filtered students as CSV"
            >
              <span aria-hidden="true">📊</span> Export CSV
            </button>
          )}

          <button
            type="button"
            className="primary-button add-student-prominent-btn"
            onClick={() => onNavigate("register")}
          >
            <span aria-hidden="true">+</span> Register Student
          </button>
        </div>
      </div>

      {/* Directory Card */}
      <section className="directory-panel" aria-label="Student Directory">
        {/* Controls Bar */}
        <div className="directory-controls-header">
          <div className="filter-bar" role="search" aria-label="Search and filter students">
            <div className="search-field">
              <span className="field-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, phone, or ID..."
                aria-label="Search students by name, email, phone, or ID"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="filter-select-group">
              <label className="compact-field">
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <label className="compact-field">
                <span>Course</span>
                <select
                  value={courseFilter}
                  onChange={(event) => setCourseFilter(event.target.value)}
                  aria-label="Filter by course"
                >
                  <option value="">All Courses</option>
                  {COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </label>

              <label className="compact-field">
                <span>Sort By</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort student records"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </label>
            </div>

            {isFiltering && (
              <button
                type="button"
                className="reset-filter-btn"
                onClick={clearFilters}
                title="Reset all filters"
              >
                <span aria-hidden="true">↺</span> Clear
              </button>
            )}
          </div>

          <div className="controls-meta">
            <span className="record-count" aria-live="polite">
              Showing {filteredAndSortedStudents.length} of {students.length} {students.length === 1 ? "student" : "students"}
            </span>
          </div>
        </div>

        {/* Directory Content */}
        {students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">📝</div>
            <h3>Your student directory is ready</h3>
            <p>Register your first student to get started managing admissions.</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => onNavigate("register")}
            >
              + Register Student
            </button>
          </div>
        ) : filteredAndSortedStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">🔎</div>
            <h3>No matching students found</h3>
            <p>Try adjusting your search query or filters to find what you're looking for.</p>
            <button
              type="button"
              className="secondary-button empty-reset-btn"
              onClick={clearFilters}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <StudentTable
            students={filteredAndSortedStudents}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </section>
    </div>
  );
}

export default Students;
