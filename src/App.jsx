import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Navbar from "./components/Navbar";
import ViewUser from "./components/ViewUser";
import EditUser from "./components/EditUser";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import RegisterStudent from "./pages/RegisterStudent";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const STORAGE_KEY = "students";
const THEME_KEY = "theme";

function getPageFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (!hash || hash === "dashboard") return "dashboard";
  if (hash === "students") return "students";
  if (hash === "register" || hash === "students/register") return "register";
  if (hash === "settings") return "settings";
  return "not-found";
}

function App() {
  // 1. Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("Failed to persist theme preference:", error);
    }
  }, [theme]);

  // 2. Students Data State
  const [students, setStudents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Corrupted localStorage detected, resetting to empty list:", error);
      return [];
    }
  });

  const [currentPage, setCurrentPage] = useState(getPageFromHash);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Sync hash changes (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (error) {
      console.error("Failed to persist students to localStorage:", error);
    }
  }, [students]);

  // Dynamic Document Title
  useEffect(() => {
    const titles = {
      dashboard: "Dashboard | Student Management System",
      students: "Student Directory | Student Management System",
      register: "Register Student | Student Management System",
      settings: "Settings & Backups | Student Management System",
      "not-found": "404 Page Not Found | Student Management System",
    };
    document.title = titles[currentPage] || "Student Management System";
  }, [currentPage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addStudent = (newStudent) => {
    setStudents((current) => [newStudent, ...current]);
  };

  const handleStudentUpdated = (updatedStudent) => {
    if (selectedUser?.id === updatedStudent.id) {
      setSelectedUser(updatedStudent);
    }
  };

  const deleteStudent = async (student) => {
    if (!student) return;

    const studentName =
      `${student.FirstName || ""} ${student.LastName || ""}`.trim() ||
      "this student";

    const result = await Swal.fire({
      title: "Delete Student Record?",
      html: `<strong>${studentName}</strong> (${student.Email || "No email"}) will be permanently removed from the directory.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete Record",
      cancelButtonText: "Keep Record",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setStudents((current) => current.filter((item) => item.id !== student.id));

      if (selectedUser?.id === student.id) {
        setSelectedUser(null);
      }
      if (editUser?.id === student.id) {
        setEditUser(null);
      }

      await Swal.fire({
        title: "Record Deleted",
        text: `${studentName} was removed from the directory.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-shell">
        {/* Top Navigation */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Dynamic Main Page Content */}
        <main className="page-content" id="main-content">
          {currentPage === "dashboard" && (
            <Dashboard
              students={students}
              onNavigate={handleNavigate}
              onView={(student) => setSelectedUser(student)}
              onEdit={(student) => setEditUser(student)}
              onDelete={deleteStudent}
            />
          )}

          {currentPage === "students" && (
            <Students
              students={students}
              onNavigate={handleNavigate}
              onView={(student) => setSelectedUser(student)}
              onEdit={(student) => setEditUser(student)}
              onDelete={deleteStudent}
            />
          )}

          {currentPage === "register" && (
            <RegisterStudent
              addStudent={addStudent}
              existingStudents={students}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === "settings" && (
            <Settings
              theme={theme}
              setTheme={setTheme}
              students={students}
              setStudents={setStudents}
            />
          )}

          {currentPage === "not-found" && (
            <NotFound onNavigate={handleNavigate} />
          )}
        </main>

        {/* View Student Modal */}
        <ViewUser
          selectedUser={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(student) => setEditUser(student)}
        />

        {/* Edit Student Modal */}
        {editUser && (
          <EditUser
            editUser={editUser}
            setEditUser={setEditUser}
            setStudents={setStudents}
            onStudentUpdated={handleStudentUpdated}
            existingStudents={students}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
export { App };