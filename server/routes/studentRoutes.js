import { Router } from "express";
import {
  getStudents,
  getStudentById,
  searchStudents,
  getStudentStats,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const router = Router();

router.get("/", getStudents);
router.get("/stats", getStudentStats);
router.get("/search", searchStudents);
router.get("/:id", getStudentById);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
