import studentService from "../services/studentService.js";

export async function getStudents(req, res, next) {
  try {
    const students = await studentService.getAllStudents(req.query);
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchStudents(req, res, next) {
  try {
    const { q } = req.query;
    const students = await studentService.searchStudents(q || "");
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudentStats(req, res, next) {
  try {
    const stats = await studentService.getStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const created = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const updated = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Student updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: "Student deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
