function ViewUser({ selectedUser, onClose }) {
  if (!selectedUser) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="student-details-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose} aria-label="Close details">×</button>
        <div className="modal-profile"><span className="large-avatar">{selectedUser.FirstName.charAt(0)}{selectedUser.LastName.charAt(0)}</span><div><p className="eyebrow">Student profile</p><h2 id="student-details-title">{selectedUser.FirstName} {selectedUser.LastName}</h2><span className={`status-pill status-${selectedUser.Status || "pending"}`}>{selectedUser.Status || "Pending"}</span></div></div>
        <div className="detail-grid"><div><span>Email address</span><strong>{selectedUser.Email}</strong></div><div><span>Course</span><strong>{selectedUser.Course || "Not assigned"}</strong></div><div><span>Date of birth</span><strong>{selectedUser.Dob || "Not provided"}</strong></div><div><span>Record ID</span><strong>#{String(selectedUser.id).slice(-6)}</strong></div></div>
        <button type="button" className="secondary-button" onClick={onClose}>Close details</button>
      </section>
    </div>
  );
}

export default ViewUser;