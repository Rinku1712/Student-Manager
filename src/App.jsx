import { useEffect, useState, useCallback, useTransition } from "react";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import studentApi from "./services/studentApi";

const STORAGE_KEY = "students";
const MIGRATION_KEY = "sms_migrated_to_api";
const THEME_KEY = "theme";

const PROTECTED_PAGES = ["dashboard", "students", "register", "settings", "profile"];
const AUTH_PAGES = ["login", "signup", "forgot-password", "reset-password"];

function parseCurrentRoute() {
  // Check hash first
  const fullHash = window.location.hash.replace(/^#\/?/, "");
  const [hashRoute, hashQuery] = fullHash.split("?");
  const hashNormalized = (hashRoute || "").toLowerCase();

  // Check pathname (e.g. /verify-email)
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();

  // Determine active route string (hash prioritized if explicit, else pathname)
  const routePath = hashNormalized || pathname;

  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(hashQuery || "");
  const redirectParam = urlParams.get("redirect") || hashParams.get("redirect") || "";

  if (!routePath || routePath === "dashboard") return { page: "dashboard", redirect: redirectParam };
  if (routePath === "students") return { page: "students", redirect: redirectParam };
  if (routePath === "register" || routePath === "students/register") return { page: "register", redirect: redirectParam };
  if (routePath === "settings") return { page: "settings", redirect: redirectParam };
  if (routePath === "profile") return { page: "profile", redirect: redirectParam };

  if (routePath === "login") return { page: "login", redirect: redirectParam };
  if (routePath === "signup") return { page: "signup", redirect: redirectParam };
  if (routePath === "verify-email") return { page: "verify-email", redirect: redirectParam };
  if (routePath === "forgot-password") return { page: "forgot-password", redirect: redirectParam };
  if (routePath === "reset-password") return { page: "reset-password", redirect: redirectParam };

  return { page: "not-found", redirect: "" };
}

function MainApp() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [, startTransition] = useTransition();

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

  // 2. Navigation & Route State
  const [routeState, setRouteState] = useState(parseCurrentRoute);
  const { page: currentPage, redirect: redirectTarget } = routeState;

  // 3. Students Data State (only loaded when authenticated)
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Sync hash and path navigation changes
  useEffect(() => {
    const handleRouteChange = () => {
      startTransition(() => {
        setRouteState(parseCurrentRoute());
      });
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const handleNavigate = useCallback((page, redirect = "") => {
    const targetHash = redirect ? `${page}?redirect=${encodeURIComponent(redirect)}` : page;
    window.location.hash = targetHash;
    setRouteState({ page, redirect });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Declarative Route Guard
  const effectivePage = (() => {
    if (!authLoading && !isAuthenticated && PROTECTED_PAGES.includes(currentPage)) {
      return "login";
    }
    if (!authLoading && isAuthenticated && AUTH_PAGES.includes(currentPage)) {
      return redirectTarget || "dashboard";
    }
    return currentPage;
  })();

  // Load students only when user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let ignore = false;

    async function loadData() {
      setIsLoadingStudents(true);
      setConnectionError(null);

      try {
        const backendStudents = await studentApi.getStudents();

        // One-time localStorage migration if needed
        const migrationDone = localStorage.getItem(MIGRATION_KEY);
        if (!migrationDone) {
          let localStudents = [];
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            localStudents = raw ? JSON.parse(raw) : [];
          } catch {
            localStudents = [];
          }

          if (Array.isArray(localStudents) && localStudents.length > 0) {
            const existingEmails = new Set(
              backendStudents.map((s) => s.Email?.toLowerCase())
            );

            const toMigrate = localStudents.filter(
              (s) => s.Email && !existingEmails.has(s.Email.toLowerCase())
            );

            if (toMigrate.length > 0) {
              for (const legacy of toMigrate) {
                try {
                  const cleanedMobile = (legacy.Mobile || legacy.Phone || "").replace(/\D/g, "");
                  const validMobile = cleanedMobile.length === 10 ? cleanedMobile : "9876543210";
                  await studentApi.createStudent({
                    FirstName: legacy.FirstName || "Student",
                    LastName: legacy.LastName || "",
                    Email: legacy.Email,
                    Mobile: validMobile,
                    Course: legacy.Course || "BCA",
                    Status: legacy.Status || "active",
                    Dob: legacy.Dob || "",
                    Password: legacy.Password || "Password123",
                  });
                } catch (migErr) {
                  console.warn("Skipping legacy student during migration:", legacy.Email, migErr);
                }
              }

              const refreshed = await studentApi.getStudents();
              if (!ignore) {
                setStudents(refreshed);
              }
            } else if (!ignore) {
              setStudents(backendStudents);
            }
          } else if (!ignore) {
            setStudents(backendStudents);
          }

          try {
            localStorage.setItem(MIGRATION_KEY, "true");
          } catch {}
        } else if (!ignore) {
          setStudents(backendStudents);
        }
      } catch (error) {
        console.error("Backend fetch error:", error);
        if (!ignore) {
          setConnectionError(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoadingStudents(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  // Keep local backup in sync
  useEffect(() => {
    if (students.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (error) {
        console.error("Backup failed:", error);
      }
    }
  }, [students]);

  // Dynamic Document Title
  useEffect(() => {
    const titles = {
      dashboard: "Dashboard | Student Management System",
      students: "Student Directory | Student Management System",
      register: "Register Student | Student Management System",
      settings: "Settings & Backups | Student Management System",
      profile: "My Profile | Student Management System",
      login: "Sign In | Student Management System",
      signup: "Create Account | Student Management System",
      "verify-email": "Verify Email | Student Management System",
      "forgot-password": "Reset Password | Student Management System",
      "reset-password": "New Password | Student Management System",
      "not-found": "404 Not Found | Student Management System",
    };
    document.title = titles[effectivePage] || "Student Management System";
  }, [effectivePage]);

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
      try {
        await studentApi.deleteStudent(student.id);

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
      } catch (error) {
        console.error("Failed to delete student:", error);
        await Swal.fire({
          title: "Delete Failed",
          text: error.message || "Failed to remove student from backend server.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-dots" aria-hidden="true" />
        <p>Restoring secure session...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Offline / Backend Warning Banner */}
      {connectionError && isAuthenticated && (
        <div
          className="connection-warning-banner"
          style={{
            background: "rgba(220, 38, 38, 0.1)",
            borderBottom: "1px solid rgba(220, 38, 38, 0.3)",
            padding: "0.75rem 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.875rem",
          }}
        >
          <span>
            ⚠️ <strong>Backend Offline:</strong> {connectionError}
          </span>
          <button
            type="button"
            className="secondary-button"
            style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentPage={effectivePage}
        onNavigate={handleNavigate}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Dynamic Main Page Content */}
      <main className="page-content" id="main-content">
        {/* PUBLIC AUTH ROUTES */}
        {effectivePage === "login" && (
          <Login onNavigate={handleNavigate} redirect={redirectTarget || (currentPage !== "login" && PROTECTED_PAGES.includes(currentPage) ? currentPage : "dashboard")} />
        )}

        {effectivePage === "signup" && (
          <Signup onNavigate={handleNavigate} />
        )}

        {effectivePage === "verify-email" && (
          <VerifyEmail onNavigate={handleNavigate} />
        )}

        {effectivePage === "forgot-password" && (
          <ForgotPassword onNavigate={handleNavigate} />
        )}

        {effectivePage === "reset-password" && (
          <ResetPassword onNavigate={handleNavigate} />
        )}

        {/* PROTECTED ROUTES */}
        {effectivePage === "dashboard" && isAuthenticated && (
          <Dashboard
            students={students}
            isLoading={isLoadingStudents}
            onNavigate={handleNavigate}
            onView={(student) => setSelectedUser(student)}
            onEdit={(student) => setEditUser(student)}
            onDelete={deleteStudent}
          />
        )}

        {effectivePage === "students" && isAuthenticated && (
          <Students
            students={students}
            isLoading={isLoadingStudents}
            onNavigate={handleNavigate}
            onView={(student) => setSelectedUser(student)}
            onEdit={(student) => setEditUser(student)}
            onDelete={deleteStudent}
          />
        )}

        {effectivePage === "register" && isAuthenticated && (
          <RegisterStudent
            addStudent={addStudent}
            existingStudents={students}
            onNavigate={handleNavigate}
          />
        )}

        {effectivePage === "settings" && isAuthenticated && (
          <Settings
            theme={theme}
            setTheme={setTheme}
            students={students}
            setStudents={setStudents}
          />
        )}

        {effectivePage === "profile" && isAuthenticated && (
          <Profile onNavigate={handleNavigate} />
        )}

        {effectivePage === "not-found" && (
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
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
export { App };