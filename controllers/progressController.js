import { Progress } from '../models/Progress.js';
import { Course } from '../models/Course.js';

export const getAllProgress = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const progress = await Progress.findOne({ userId, courseId });
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const totalLectures = course.sections.reduce((total, section) => 
      total + section.section_lectures.length, 0);

    const completedLectures = progress ? progress.completedLectures.length : 0;

    res.status(200).json({
      lastLectureAccessed : progress.lastLecture,
      totalLectures,
      completedLectures,
      completedLectureArray: progress.completedLectures,
      overallProgress: parseFloat(((completedLectures / totalLectures) * 100).toFixed(1))
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching progress", error: error.message });
  }
};

export const savePartialProgress = async (req, res) => {
  try {
    const { userId, courseId, lectureNumber, progress } = req.body;

    // console.log(lectureNumber)
    if (lectureNumber === 0 || lectureNumber == null) {
      return res.status(200).json({ message: "Progress not needed to be saved" });
    }
    // Find the existing progress document or create a new one
    let userProgress = await Progress.findOne({ userId, courseId });

    if (!userProgress) {
      userProgress = new Progress({
        userId,
        courseId,
        completedLectures: [],
        lectureProgress: []
      });
    }
  
    // Ensure lectureProgress is an array
    if (!Array.isArray(userProgress.lectureProgress)) {
      userProgress.lectureProgress = [];
    }

    // Check if the lecture is already completed
    const isAlreadyCompleted = userProgress.completedLectures.includes(lectureNumber);

    // Update the lectureProgress array
    const lectureProgressIndex = userProgress.lectureProgress.findIndex(
      lp => lp.lectureNo === lectureNumber
    );

    if (lectureProgressIndex > -1) {
      // If the lecture is already completed, keep it at 100% progress
      if (isAlreadyCompleted) {
        userProgress.lectureProgress[lectureProgressIndex].progress = 100;
      } else {
        // If not completed, update progress only if the new progress is higher
        userProgress.lectureProgress[lectureProgressIndex].progress = 
          Math.max(userProgress.lectureProgress[lectureProgressIndex].progress, progress);
      }
    } else {
      userProgress.lectureProgress.push({ lectureNo: lectureNumber, progress });
    }

    // Ensure all items in lectureProgress have both lectureNo and progress
    userProgress.lectureProgress = userProgress.lectureProgress.filter(
      lp => lp.lectureNo !== undefined && lp.progress !== undefined
    );

    // Update completedLectures
    if (progress === 100 && !isAlreadyCompleted) {
      userProgress.completedLectures.push(lectureNumber);
    }
    // We no longer remove lectures from completedLectures

    // Save the updated progress
    await userProgress.save();

    res.status(200).json({ message: "Progress saved successfully", progress: userProgress });
  } catch (error) {
    res.status(500).json({ message: "Error saving progress", error: error.message });
  }
};


export const updateLastLecture = async (req, res) => {
  try {
    const { userId, courseId , lastLecture } = req.body;

    const updatedProgress = await Progress.findOneAndUpdate(
      { userId, courseId },
      { lastLecture },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "lastLecture updated successfully",
      lastLectureAccessed : updatedProgress.lastLecture
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};