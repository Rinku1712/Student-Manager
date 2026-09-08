import { useState } from "react";
import Swal from "sweetalert2";

const initialForm = { FirstName: "", LastName: "", Email: "", Password: "", Dob: "", Status: "", Course: "" };

function StudentForm({ addStudent }) {
  const [formData, setFormData] = useState(initialForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await Swal.fire({ title: "Save this student?", text: "The record will be added to your directory.", icon: "question", showCancelButton: true, confirmButtonText: "Save student", cancelButtonText: "Review again", confirmButtonColor: "#0f766e" });
    if (!result.isConfirmed) return;
    addStudent({ ...formData, id: Date.now() });
    setFormData(initialForm);
    await Swal.fire({ title: "Student saved", text: "The directory has been updated.", icon: "success", timer: 1600, showConfirmButton: false });
  };

  return (
    <section className="form-panel">
      <div className="panel-heading form-heading"><div><p className="eyebrow">New record</p><h2>Register a student</h2></div><span className="form-badge">Required fields marked *</span></div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid two-columns">
          <label className="form-field"><span>First name *</span><input required name="FirstName" value={formData.FirstName} onChange={handleChange} placeholder="e.g. Aisha" /></label>
          <label className="form-field"><span>Last name *</span><input required name="LastName" value={formData.LastName} onChange={handleChange} placeholder="e.g. Khan" /></label>
        </div>
        <label className="form-field"><span>Email address *</span><input required type="email" name="Email" value={formData.Email} onChange={handleChange} placeholder="student@example.com" /></label>
        <div className="form-grid two-columns">
          <label className="form-field"><span>Date of birth</span><input type="date" name="Dob" value={formData.Dob} onChange={handleChange} /></label>
          <label className="form-field"><span>Enrollment status *</span><select required name="Status" value={formData.Status} onChange={handleChange}><option value="">Select status</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        </div>
        <label className="form-field"><span>Course *</span><select required name="Course" value={formData.Course} onChange={handleChange}><option value="">Select course</option><option value="BCA">BCA</option><option value="B-Tech">B-Tech</option><option value="B.COM">B.COM</option><option value="BBA">BBA</option><option value="BA">BA</option></select></label>
        <label className="form-field"><span>Temporary password *</span><input required type="password" name="Password" value={formData.Password} onChange={handleChange} placeholder="Create a secure password" minLength="6" /></label>
        <button className="primary-button" type="submit"><span aria-hidden="true">+</span> Add student</button>
      </form>
    </section>
  );
}

export default StudentForm;