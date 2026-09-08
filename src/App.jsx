import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import StudentForm from "./StudentForm";
import ViewUser from "./Veiwuser";
import EditUser from "./EditUser";

const STORAGE_KEY = "students";

function App() {
  const [students, setStudents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    return students.filter((student) => {
      const searchableValues = [student.FirstName, student.LastName, student.Email];
      const matchesSearch = !normalizedSearchTerm || searchableValues.some((value) => value.toLowerCase().includes(normalizedSearchTerm));
      const matchesStatus = !statusFilter || student.Status === statusFilter;
      const matchesCourse = !courseFilter || student.Course === courseFilter;
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, searchTerm, statusFilter, courseFilter]);

  const activeCount = students.filter((student) => student.Status === "active").length;
  const inactiveCount = students.filter((student) => student.Status === "inactive").length;
  const courseCount = new Set(students.map((student) => student.Course).filter(Boolean)).size;
  const addStudent = (student) => setStudents((current) => [...current, student]);

  const deleteStudent = async (student) => {
    const result = await Swal.fire({
      title: "Delete this student?",
      text: `${student.FirstName} ${student.LastName} will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete student",
      cancelButtonText: "Keep student",
      confirmButtonColor: "#dc2626",
    });
    if (result.isConfirmed) {
      setStudents((current) => current.filter((item) => item.id !== student.id));
      if (selectedUser?.id === student.id) setSelectedUser(null);
      if (editUser?.id === student.id) setEditUser(null);
      await Swal.fire({ title: "Student deleted", icon: "success", timer: 1400, showConfirmButton: false });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCourseFilter("");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">SM</div>
        <div><p className="eyebrow">Administration portal</p><h1>Student management</h1></div>
        <div className="topbar-meta"><span className="status-dot" /><span>Academic year 2025/26</span></div>
      </header>
      <main className="page-content">
        <section className="welcome-row"><div><p className="eyebrow">Overview</p><h2>Keep your student records organized.</h2><p className="muted-copy">Register, review, and maintain your student directory from one place.</p></div><div className="date-chip">Updated today</div></section>
        <section className="stats-grid" aria-label="Student statistics">
          <div className="stat-card"><span className="stat-label">Total students</span><strong>{students.length}</strong><span className="stat-note">Registered records</span></div>
          <div className="stat-card stat-card-green"><span className="stat-label">Active students</span><strong>{activeCount}</strong><span className="stat-note">Currently enrolled</span></div>
          <div className="stat-card stat-card-amber"><span className="stat-label">Inactive students</span><strong>{inactiveCount}</strong><span className="stat-note">Needs follow-up</span></div>
          <div className="stat-card stat-card-purple"><span className="stat-label">Courses represented</span><strong>{courseCount}</strong><span className="stat-note">Across the directory</span></div>
        </section>
        <div className="workspace-grid">
          <StudentForm addStudent={addStudent} />
          <section className="directory-panel">
            <div className="panel-heading"><div><p className="eyebrow">Directory</p><h2>Student records</h2></div><span className="record-count">{filteredStudents.length} of {students.length}</span></div>
            <div className="filter-bar">
              <label className="search-field"><span className="field-icon" aria-hidden="true">⌕</span><span className="sr-only">Search students</span><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search name or email" /></label>
              <label className="compact-field"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <label className="compact-field"><span>Course</span><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option value="">All courses</option><option value="BCA">BCA</option><option value="B-Tech">B-Tech</option><option value="B.COM">B.COM</option><option value="BBA">BBA</option><option value="BA">BA</option></select></label>
              {(searchTerm || statusFilter || courseFilter) && <button type="button" className="text-button" onClick={clearFilters}>Clear</button>}
            </div>
            {students.length === 0 ? <div className="empty-state"><div className="empty-icon">+</div><h3>Your directory is ready</h3><p>Add the first student using the registration form.</p></div> : filteredStudents.length === 0 ? <div className="empty-state"><div className="empty-icon">⌕</div><h3>No matching students</h3><p>Try changing your search or filters.</p></div> : (
              <div className="table-wrap"><table><thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Status</th><th className="actions-heading">Actions</th></tr></thead><tbody>{filteredStudents.map((student) => <tr key={student.id}><td><div className="student-cell"><span className="avatar">{student.FirstName.charAt(0)}{student.LastName.charAt(0)}</span><span><strong>{student.FirstName} {student.LastName}</strong><small>Added to directory</small></span></div></td><td className="email-cell">{student.Email}</td><td><span className="course-pill">{student.Course || "Unassigned"}</span></td><td><span className={`status-pill status-${student.Status || "pending"}`}>{student.Status || "Pending"}</span></td><td><div className="row-actions"><button type="button" className="action-button" onClick={() => setSelectedUser(student)}>View</button><button type="button" className="action-button action-edit" onClick={() => setEditUser(student)}>Edit</button><button type="button" className="action-button action-delete" onClick={() => deleteStudent(student)}>Delete</button></div></td></tr>)}</tbody></table></div>
            )}
          </section>
        </div>
      </main>
      <ViewUser selectedUser={selectedUser} onClose={() => setSelectedUser(null)} />
      {editUser && <EditUser editUser={editUser} setEditUser={setEditUser} setStudents={setStudents} />}
    </div>
  );
}

export default App;