

import express from 'express';
import { getAllCourses } from '../controllers/coursedataController.js';
import { getCourseById } from '../controllers/coursedataController.js'
import { getCourseBySlug } from '../controllers/coursedataController.js';

const router = express.Router();

router.get('/coursesdata', getAllCourses);
router.get('/coursesdatabyid/:id', getCourseById);
router.get('/coursesdata/:slug', getCourseBySlug);


export default router;


