import express from "express";
// import { enrollInCourse, getMyEnrollments } from '../controllers/enrollmentController.js';
// import { getMyEnrollments } from '../controllers/enrollmentController.js';
import { getMyEnrollments , razorpayWebhook} from '../controllers/EnrollmentController.js';

import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post('/enroll', razorpayWebhook);
// router.post('/enroll',  enrollInCourse);

// router.get('/my-enrollments', getMyEnrollments);
router.get('/my-enrollments', isAuthenticated, getMyEnrollments);

export default router;