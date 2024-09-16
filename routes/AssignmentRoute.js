import express from "express";
import { getRegisteredCourses } from "../controllers/userController.js";
import singleUpload from "../middlewares/multer.js";
import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignment,
  getAssignmentsByCourseId,
  updateAssignment,
} from "../controllers/assignmentController.js";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//get all Assignments
router.route("/assignments").get(isAuthenticated, getAllAssignments);

//get user assignments by courseId
router.route("/assignments/:id").get(isAuthenticated, getAssignmentsByCourseId);

//create Assignment
router
  .route("/createAssignment")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createAssignment);

//Update, Delete, and Get Assignment
router
  .route("/assignment/:id")
  .get(isAuthenticated, getAssignment)
  .delete(isAuthenticated, authorizeAdmin, deleteAssignment)
  .put(isAuthenticated, authorizeAdmin, singleUpload, updateAssignment);

export default router;
