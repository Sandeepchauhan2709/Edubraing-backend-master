import express from "express";

const router = express.Router();
// import {getCourseProgress, getLastPlayedVideo,  saveCourseProgress, saveLastPlayedVideo, } from "../controllers/progressController.js"
// import {getCourseProgress , updateCourseProgress} from "../controllers/progressController.js"

import {getAllProgress, savePartialProgress,markLectureAsComplete,saveCourseAsComplete } from "../controllers/progressController.js";
router.route("/progress/:userId/:courseId/:courseName").get(getAllProgress);
router.route("/partial/").post(savePartialProgress);
router.route("/complete-lecture/").post(markLectureAsComplete);
router.route("/complete-course/").post(saveCourseAsComplete);
// router.route("/lastvideo/:userId/:courseId").get(getLastPlayedVideo)
// router.route("/savelastvideo").post(saveLastPlayedVideo);

export default router;
