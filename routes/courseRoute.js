

import express from 'express';
import { getAllCourses } from '../controllers/coursedataController.js';
import { getCourseById } from '../controllers/coursedataController.js'
import { getCourseBySlug } from '../controllers/coursedataController.js';
import { isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

router.get('/coursesdata', getAllCourses);
router.get('/coursesdatabyid/:id', getCourseById);
router.get('/coursesdata/:slug', isAuthenticated, getCourseBySlug);


export default router;


0