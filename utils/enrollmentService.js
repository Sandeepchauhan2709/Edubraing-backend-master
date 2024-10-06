import { User } from '../models/User';
import { Enrollment } from '../models/Enrollment';
import { courseDetails } from '../models/CourseDetails';
import { Progress } from '../models/Progress';

async function enrollUserInCourse(userId, courseId, paymentAmount, paymentMethod) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    const course = await courseDetails.findOne({ courseId }).session(session);

    if (!user || !course) {
      throw new Error('User or course not found');
    }

    // Create new enrollment
    const enrollment = await Enrollment.create([{
      user: userId,
      course: courseId,
      courseDetails: course._id,
      paymentAmount,
      paymentMethod,
      paymentStatus: 'completed', // Assume payment is completed
    }], { session });

    // Add course to user's enrolledCourses
    user.enrolledCourses.push(courseId);
    await user.save({ session });

    // Create initial progress record
    await Progress.create([{
      userId,
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

export { enrollUserInCourse };