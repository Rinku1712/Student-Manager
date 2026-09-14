import { useRef } from "react";
import Swal from "sweetalert2";
import {
  exportStudentsToCSV,
  exportStudentsToJSON,
  parseAndValidateImport,
} from "../utils/exportImport";

function Settings({
  theme,
  setTheme,
  students = [],
  setStudents,
}) {
  const fileInputRef = useRef(null);

  const handleToggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const handleExportCSV = () => {
    if (!students.length) {
      Swal.fire({
        title: "No Records to Export",
        text: "Add at least one student before exporting.",
        icon: "info",
        confirmButtonColor: "#0f766e",
      });
      return;
    }
    exportStudentsToCSV(students);
  };

  const handleExportJSON = () => {
    if (!students.length) {
      Swal.fire({
        title: "No Records to Export",
        text: "Add at least one student before exporting.",
        icon: "info",
        confirmButtonColor: "#0f766e",
      });
      return;
    }
    exportStudentsToJSON(students);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseAndValidateImport(file, students);

      if (!result.success) {
        await Swal.fire({
          title: "Import Failed",
          text: result.error || "Unable to parse JSON file.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      const { validNewStudents, duplicateCount, invalidCount, totalParsed } =
        result;

      if (validNewStudents.length === 0) {
        await Swal.fire({
          title: "No New Records Imported",
          html: `Processed <strong>${totalParsed}</strong> items:<br/>• ${duplicateCount} already registered (skipped)<br/>• ${invalidCount} invalid format`,
          icon: "warning",
          confirmButtonColor: "#0f766e",
        });
        return;
      }

      setStudents((current) => [...validNewStudents, ...current]);

      await Swal.fire({
        title: "Import Completed",
        html: `Successfully imported <strong>${validNewStudents.length}</strong> new student records.<br/>• ${duplicateCount} duplicates skipped<br/>• ${invalidCount} invalid skipped`,
        icon: "success",
        confirmButtonColor: "#0f766e",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearAll = async () => {
    if (!students.length) {
      Swal.fire({
        title: "Directory Already Empty",
        text: "There are no student records to clear.",
        icon: "info",
        confirmButtonColor: "#0f766e",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Clear All Student Records?",
      html: `You are about to delete <strong>${students.length} student records</strong> permanently. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete Everything",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setStudents([]);
      await Swal.fire({
        title: "Directory Cleared",
        text: "All student records have been permanently removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header-title">
        <p className="eyebrow">Preferences & Tools</p>
        <h2>Settings & Data Management</h2>
        <p className="muted-copy">
          Configure appearance, backup academic records, or restore directory data from JSON.
        </p>
      </div>

      <div className="settings-grid">
        {/* Appearance Card */}
        <section className="dashboard-card settings-card" aria-labelledby="appearance-heading">
          <div className="card-header">
            <h3 id="appearance-heading">Appearance</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc">
              Choose your preferred visual theme. Preference is saved automatically.
            </p>
            <div className="theme-toggle-group">
              <button
                type="button"
                className={`theme-card-option ${theme === "light" ? "theme-card-selected" : ""}`}
                onClick={() => handleToggleTheme("light")}
                aria-pressed={theme === "light"}
              >
                <div className="theme-preview light-preview" aria-hidden="true" />
                <div className="theme-label-row">
                  <span className="theme-icon" aria-hidden="true">☀️</span>
                  <strong>Light Mode</strong>
                </div>
              </button>

              <button
                type="button"
                className={`theme-card-option ${theme === "dark" ? "theme-card-selected" : ""}`}
                onClick={() => handleToggleTheme("dark")}
                aria-pressed={theme === "dark"}
              >
                <div className="theme-preview dark-preview" aria-hidden="true" />
                <div className="theme-label-row">
                  <span className="theme-icon" aria-hidden="true">🌙</span>
                  <strong>Dark Mode</strong>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Export Card */}
        <section className="dashboard-card settings-card" aria-labelledby="export-heading">
          <div className="card-header">
            <h3 id="export-heading">Export Student Records</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc">
              Download your directory to backup or import into spreadsheet software (e.g. Excel, Google Sheets).
            </p>
            <div className="settings-btn-row">
              <button
                type="button"
                className="secondary-button"
                onClick={handleExportCSV}
              >
                <span aria-hidden="true">📊</span> Export as CSV
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleExportJSON}
              >
                <span aria-hidden="true">📦</span> Export as JSON
              </button>
            </div>
          </div>
        </section>

        {/* Import Card */}
        <section className="dashboard-card settings-card" aria-labelledby="import-heading">
          <div className="card-header">
            <h3 id="import-heading">Import Student Records</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc">
              Restore or bulk-add students from an exported JSON file. Duplicate emails and invalid records will be skipped automatically.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImportFile}
              id="import-json-input"
            />
            <button
              type="button"
              className="primary-button"
              onClick={() => fileInputRef.current?.click()}
            >
              <span aria-hidden="true">📥</span> Choose JSON File to Import
            </button>
          </div>
        </section>

        {/* Danger Zone Card */}
        <section className="dashboard-card settings-card danger-card" aria-labelledby="danger-heading">
          <div className="card-header">
            <h3 id="danger-heading" className="danger-heading-text">Danger Zone</h3>
          </div>
          <div className="settings-card-body">
            <p className="settings-desc">
              Permanently erase all {students.length} student records from your local browser storage. This cannot be recovered unless you have an exported backup.
            </p>
            <button
              type="button"
              className="action-button action-delete danger-btn-large"
              onClick={handleClearAll}
            >
              <span aria-hidden="true">🗑</span> Clear All Student Records
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
