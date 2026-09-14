import { useCountUp } from "../utils/useCountUp";

function StatsCards({
  totalStudents = 0,
  activeCount = 0,
  inactiveCount = 0,
  courseCount = 0,
}) {
  const animatedTotal = useCountUp(totalStudents);
  const animatedActive = useCountUp(activeCount);
  const animatedInactive = useCountUp(inactiveCount);
  const animatedCourses = useCountUp(courseCount);

  const activePercentage =
    totalStudents > 0 ? Math.round((activeCount / totalStudents) * 100) : 0;

  return (
    <section className="stats-grid" aria-label="Student Directory Statistics">
      <div className="stat-card stat-card-blue animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="stat-header">
          <span className="stat-label">Total Students</span>
          <span className="stat-icon" aria-hidden="true">👥</span>
        </div>
        <strong className="stat-value">{animatedTotal}</strong>
        <span className="stat-note">All registered directory records</span>
      </div>

      <div className="stat-card stat-card-green animate-fade-in-up" style={{ animationDelay: "120ms" }}>
        <div className="stat-header">
          <span className="stat-label">Active Students</span>
          <span className="stat-icon" aria-hidden="true">🎓</span>
        </div>
        <strong className="stat-value">{animatedActive}</strong>
        <span className="stat-note">
          {totalStudents > 0
            ? `${activePercentage}% currently enrolled`
            : "No active students"}
        </span>
      </div>

      <div className="stat-card stat-card-amber animate-fade-in-up" style={{ animationDelay: "190ms" }}>
        <div className="stat-header">
          <span className="stat-label">Inactive Students</span>
          <span className="stat-icon" aria-hidden="true">⏸</span>
        </div>
        <strong className="stat-value">{animatedInactive}</strong>
        <span className="stat-note">Pending or paused enrollments</span>
      </div>

      <div className="stat-card stat-card-purple animate-fade-in-up" style={{ animationDelay: "260ms" }}>
        <div className="stat-header">
          <span className="stat-label">Courses Offered</span>
          <span className="stat-icon" aria-hidden="true">📚</span>
        </div>
        <strong className="stat-value">{animatedCourses}</strong>
        <span className="stat-note">Active academic programs</span>
      </div>
    </section>
  );
}

export default StatsCards;
