import Swal from "sweetalert2";

function EditUser({ editUser, setEditUser, setStudents }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditUser((current) => ({ ...current, [name]: value }));
  };

  const handleUpdate = async () => {
    setStudents((current) => current.map((student) => student.id === editUser.id ? editUser : student));
    setEditUser(null);
    await Swal.fire({ title: "Changes saved", text: `${editUser.FirstName} ${editUser.LastName}'s record was updated.`, icon: "success", timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={() => setEditUser(null)}>
      <section className="detail-modal edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-student-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={() => setEditUser(null)} aria-label="Close editor">×</button>
        <p className="eyebrow">Manage record</p><h2 id="edit-student-title">Edit student</h2><p className="modal-copy">Update the record details below and save when ready.</p>
        <div className="form-grid two-columns">
          <label className="form-field"><span>First name</span><input name="FirstName" value={editUser.FirstName} onChange={handleInputChange} /></label>
          <label className="form-field"><span>Last name</span><input name="LastName" value={editUser.LastName} onChange={handleInputChange} /></label>
        </div>
        <label className="form-field"><span>Email address</span><input type="email" name="Email" value={editUser.Email} onChange={handleInputChange} /></label>
        <div className="form-grid two-columns">
          <label className="form-field"><span>Date of birth</span><input type="date" name="Dob" value={editUser.Dob} onChange={handleInputChange} /></label>
          <label className="form-field"><span>Status</span><select name="Status" value={editUser.Status.toLowerCase()} onChange={handleInputChange}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        </div>
        <label className="form-field"><span>Course</span><select name="Course" value={editUser.Course} onChange={handleInputChange}><option value="">Select course</option><option value="BCA">BCA</option><option value="B-Tech">B-Tech</option><option value="B.COM">B.COM</option><option value="BBA">BBA</option><option value="BA">BA</option></select></label>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setEditUser(null)}>Cancel</button><button type="button" className="primary-button" onClick={handleUpdate}>Save changes</button></div>
      </section>
    </div>
  );
}

export default EditUser;