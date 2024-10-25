import { processEnrollment } from '../utils/enrollmentService.js';
import { catchAsyncError } from '../middlewares/catchAsyncError.js';
// import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
// import { courseDetails } from '../models/courseDetails.js';
import { Course } from '../models/Course.js';
import { Progress } from '../models/Progress.js';
import crypto from 'crypto';


// export const enrollInCourse = catchAsyncError(async (req, res, next) => {
//   const { courseDetailsId, paymentMethod } = req.body;
//   const userId = req.user._id;
//   // console.log(userId, paymentMethod, courseDetailsId)
//   const enrollment = await enrollUserInCourse(userId, courseDetailsId, paymentMethod);

//   res.status(201).json({
//     success: true,
//     message: "Enrolled in course successfully",
//     enrollment
//   });
// });


const verifyWebhookSignature = (webhookBody, signature, webhookSecret) => {
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(webhookBody))
    .digest('hex');
  return hash === signature;
};


export const razorpayWebhook = catchAsyncError(async (req, res, next) => {
  // Verify webhook signature
  const signature = req.headers['x-razorpay-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
  // console.log('sgasdhnsrdfhnxdfhjnxf')
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }
 
  const event = req.body;
  // console.log(req.body)
  // console.log(event.event)
  // Handle only payment.captured events
  if (event.event === 'payment.captured') {
    const paymentData = event.payload.payment.entity;
    // console.log(paymentData)
    // Extract email from payment data
    const userEmail = paymentData.notes.email;
    // console.log(userEmail)
    const courseNameTitle = paymentData.notes.product;

    await processEnrollment(userEmail, courseNameTitle, paymentData);
  
  }

  res.status(200).json({ success: true });
});






export const getMyEnrollments = catchAsyncError(async (req, res, next) => {
  // const userId = req.body.userId;
  const userId = req.user._id;
  // console.log(userId);

  const enrollments = await Enrollment.find({ user: userId })
    .populate('course')
    .populate('courseDetails')
    .lean();

  const enrollmentDetails = await Promise.all(enrollments.map(async (enrollment) => {
    const course = enrollment.course;
    const details = enrollment.courseDetails;

    // Fetch progress information
    const progress = await Progress.findOne({ userId, courseId: course._id });

    // Fetch the full course details to access sections and lectures
    const fullCourse = await Course.findById(course._id);

    // Calculate total lectures
    const totalLectures = fullCourse.sections.reduce((total, section) => 
      total + section.section_lectures.length, 0);

    // Calculate completed lectures and overall progress
    const completedLectures = progress ? progress.completedLectures.length : 0;
    const overallProgress = parseFloat(((completedLectures / totalLectures) * 100).toFixed(1));

    // Find the last accessed lecture name
    let lastLectureName = '';
    const lastLectureNo = progress ? progress.lastLecture : 0;

    if (lastLectureNo === 0) {
      // If lastLectureNo is 0, get the name of the first lecture
      if (fullCourse.sections.length > 0 && fullCourse.sections[0].section_lectures.length > 0) {
        lastLectureName = fullCourse.sections[0].section_lectures[0].lecture_name;
      }
    } else {
      // Find the lecture with the matching lecture_no
      for (const section of fullCourse.sections) {
        const lecture = section.section_lectures.find(lec => lec.lecture_no === lastLectureNo);
        if (lecture) {
          lastLectureName = lecture.lecture_name;
          break;
        }
      }
    }

    return {
      courseId: course._id,
      title: details.title,
      enrollmentDate: enrollment.enrollmentDate,
      lastLectureName,
      totalLectures,
      completedLectures,
      overallProgress,
      category: details.category,
      poster: details.poster,
      slug: details.slug
    };
  }));

  res.status(200).json({
    success: true,
    enrollments: enrollmentDetails
  });
});









