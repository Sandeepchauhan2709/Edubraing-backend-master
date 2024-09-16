import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
  updateLecture,
  updateCourse,
  sendRegisteredCourses,
} from "../controllers/courseController.js";
import { getRegisteredCourses } from "../controllers/userController.js";
import singleUpload from "../middlewares/multer.js";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

// import {getLastPlayedVideo, getProgress, saveLastPlayedVideo, saveProgress} from "../controllers/progressController.js"

const router = express.Router();

//get all course
router.route("/courses").get(getAllCourses);

//create course
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

//Add, Update lecture Delete Course, get course deatils
router
  .route("/course/:id")
  .get(getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse)
  .put(isAuthenticated, authorizeAdmin, singleUpload, updateCourse); //pending

router.route("/user/course").get(isAuthenticated, getRegisteredCourses, sendRegisteredCourses);

router
  .route("/lecture")
  .delete(isAuthenticated, authorizeAdmin, deleteLecture)
  .put(isAuthenticated, authorizeAdmin, singleUpload, updateLecture); //pending

// router.route("/progress").get(getProgress);
// router.route("/progress").post(saveProgress);
// router.route("/:userId/:courseId").get(getLastPlayedVideo)
// router.route("/savelastvideo").post(saveLastPlayedVideo);

// router.get('/:userId/:courseId', getLastPlayedVideo);
// router.post('/', saveLastPlayedVideo);



  

export default router;


