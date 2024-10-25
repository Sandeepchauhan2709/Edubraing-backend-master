// utils/enrollmentService.js
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Enrollment } from '../models/Enrollment.js';
import { courseDetails } from '../models/CourseDetails.js';
import { Progress } from '../models/Progress.js';

// Export as a named export
// export async function enrollUserInCourse(userId, courseDetailsId, paymentMethod) {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const user = await User.findById(userId).session(session);
//     const course = await courseDetails.findOne({ _id: courseDetailsId }).session(session);

//     if (!user || !course) {
//       throw new Error('User or course not found');
//     }

//     const courseId = course.courseId;
//     // Create new enrollment
//     const enrollment = await Enrollment.create([{
//       user: userId,
//       course: courseId,
//       courseDetails: course._id,
//       paymentAmount: course.basePrice,
//       paymentMethod,
//       paymentStatus: 'completed', // Assume payment is completed
//     }], { session });

//     // Add course to user's enrolledCourses
//     user.enrolledCourses.push(courseId);
//     await user.save({ session });

//     // Create initial progress record
//     await Progress.create([{
//       userId,
//       courseId,
//       completedLectures: [],
//       lastLecture: 0,
//       lectureProgress: []
//     }], { session });

//     await session.commitTransaction();
//     return enrollment[0];
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// }


export async function processEnrollment(userEmail, courseNameTitle, paymentData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Find user by email
    const user = await User.findOne({ email: userEmail }).session(session);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find course by Razorpay payment page ID
    const course = await courseDetails.findOne({ title: courseNameTitle }).session(session);
    if (!course) {
      throw new Error('Course not found');
    }

    const courseId = course.courseId;
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: user._id,
      courseDetails: course._id
    }).session(session);

    if (existingEnrollment) {
      throw new Error('User already enrolled in this course');
    }

    // Create new enrollment
    const enrollment = await Enrollment.create([{
      user: user._id,
      course: courseId,
      courseDetails: course._id,
      paymentAmount: paymentData.amount / 100, // Convert from paise to rupees
      paymentMethod: paymentData.method,
      paymentStatus: 'completed',
      currency: paymentData.currency,
      razorpayPaymentId: paymentData.id,
    }], { session });

    // Add course to user's enrolledCourses
    user.enrolledCourses.push(courseId);
    await user.save({ session });

    // Create initial progress record
    await Progress.create([{
      userId: user._id,
      courseId,
      completedLectures: [],
      lastLecture: 0,
      lectureProgress: []
    }], { session });

    await session.commitTransaction();
    return enrollment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}