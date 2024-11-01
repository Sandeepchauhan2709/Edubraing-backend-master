
import { Course } from "../models/Course.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const getCourseBySlug = async (req, res) => {
    try {
      const courseSlug = req.params.slug;
      const course = await Course.findOne({ slug: courseSlug });
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json(course);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// ==========================================
  
// export const generateCertificate = async (req, res) => {
//   try {
//     const { courseId, userId } = req.body;
//     // Check if user has completed the course
//     // This is a placeholder, replace with your actual logic
//     const isCompleted = true; // You need to implement this check
//     if (isCompleted) {
//       res.json({ success: true });
//     } else {
//       res.json({ success: false, message: 'Course not completed' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Error generating certificate' });
//   }
// };

// export const storeCertificate = async (req, res) => {
//   try {
//     const { userId, courseId, certificateData } = req.body;
//     // Store certificate data in your database
//     // This is a placeholder, implement your storage logic
//     console.log(`Storing certificate for user ${userId} for course ${courseId}`);
//     res.json({ success: true });
//   } catch (error) {
//     res.status(500).json({ message: 'Error storing certificate' });
//   }
// };




