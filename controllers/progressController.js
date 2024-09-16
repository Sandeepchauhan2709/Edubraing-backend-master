// import { CourseProgress } from "../models/CourseProgress";
import { Progress } from "../models/Progress.js";

export const savePartialProgress = async (req, res) => {
    const { userId, courseId, sectionNumber, lectureNumber, timeSpent } = req.body;
  
    try {
      let progress = await Progress.findOne({ userId, courseId });
  
      if (!progress) {
        progress = new Progress({ userId, courseId, progress: [] });
      }
  
      const sectionProgress = progress.progress.find(
        p => p.sectionNumber === sectionNumber && p.lectureNumber === lectureNumber
      );
  
      if (sectionProgress) {
        sectionProgress.timeSpent += timeSpent; 
      } else {
        progress.progress.push({
          sectionNumber,
          lectureNumber,
          timeSpent,
          completed: false,
        });
      }
  
      await progress.save();
      res.status(200).json({ message: "Partial progress saved", progress });
    } catch (err) {
      res.status(500).json({ message: "Error saving progress", error: err });
    }
  };

  export const markLectureAsComplete = async (req, res) => {
    const { userId, courseId, sectionNumber, lectureNumber } = req.body;
  
    try {
      let progress = await Progress.findOne({ userId, courseId });
  
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
  
      const sectionProgress = progress.progress.find(
        p => p.sectionNumber === sectionNumber && p.lectureNumber === lectureNumber
      );
  
      if (!sectionProgress) {
        return res.status(404).json({ message: "Lecture not found" });
      }
  
      sectionProgress.completed = true;
  
      await progress.save();
      res.status(200).json({ message: "Lecture marked as complete", progress });
    } catch (err) {
      res.status(500).json({ message: "Error marking lecture as complete", error: err });
    }
  };


export const saveCourseAsComplete = async (req, res) => {
    const { userId, courseId } = req.body;
  
    try {
      const progress = await Progress.findOneAndUpdate(
        { userId, courseId },
        { courseCompleted: true },
        { new: true }
      );
  
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
  
      res.status(200).json({ message: "Course marked as complete", progress });
    } catch (err) {
      res.status(500).json({ message: "Error marking course as complete", error: err });
    }
  };


export const getAllProgress = async (req, res) => {
    const { userId, courseId, courseName } = req.params;
  
    try {
      const progress = await Progress.findOne({ userId, courseId, courseName });
  
      if (!progress) {
        return res.status(404).json({ message: "No progress found for this user and course" });
      }
  
      res.status(200).json({ progress });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving progress", error: err });
    }
  };











// export const getCourseProgress = async (req, res) => {
//   const { userId, courseId } = req.params;

//   try {
//     const progress = await CourseProgress.findOne({ userId, courseId });
//     if (progress) {
//       res.json(progress);
//     } else {
//       res.status(404).json({ message: 'No progress found for this course.' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // save the course progress
// export const saveCourseProgress = async (req, res) => {
//   const { userId, courseId, completedPercentage } = req.body;

//   try {
//     const progress = await CourseProgress.findOneAndUpdate(
//       { userId, courseId },
//       { completedPercentage, lastUpdated: new Date() },
//       { new: true, upsert: true } // Creates a new document if not found
//     );

//     res.status(200).json({ message: 'Progress saved successfully', progress });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };



// //  last  video progress 
// let userVideoProgress = [];

// export const getLastPlayedVideo = async (req, res) => {
//   const { userId, courseId } = req.params;

//   try {
//     const progress = await CourseProgress.findOne({ userId, courseId });
//     if (progress) {
//       res.json(progress);
//     } else {
//       res.status(404).json({ message: 'No progress found for this course.' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// //save video progres
// export const saveLastPlayedVideo = async (req, res) => {
//   const { userId, courseId, videoId, currentTime } = req.body;

//   try {
//     const progress = await CourseProgress.findOneAndUpdate(
//       { userId, courseId },
//       { videoId, currentTime },
//       { new: true, upsert: true } // Upsert creates a new document if none matches the query
//     );
//     res.status(200).json({ message: 'Progress saved successfully', progress });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

// // module.exports = { getLastPlayedVideo, saveLastPlayedVideo };

