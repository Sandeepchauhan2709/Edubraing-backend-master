import { catchAsyncError } from "../middlewares/catchAsyncError.js";
// import  {Course}  from "../models/Course.js";
import {courseDetails} from "../models/CourseDetails.js";
// import  {CourseModel}  from "../models/courseModel.js";

import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

//get all  course--user
export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const courses = await courseDetails.find().select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

//create course
export const createCourse = catchAsyncError(async (req, res, next) => {
  const {
    title,
    description,
    category,
    discountedPercent,
    basePrice,
    total_duration,
    numOfVideos,
  } = req.body;

  if (
    !title ||
    !description ||
    !category ||
    !discountedPercent ||
    !basePrice ||
    !total_duration ||
    !numOfVideos
  )
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.files["file"][0];
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await courseDetails.create({
    title,
    description,
    category,
    discountedPercent,
    basePrice,
    total_duration,
    numOfVideos,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully. you can add lectures now",
  });
});

//get course lecture
export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await courseDetails.findById(req.params.id);

  if (!course) return next(new ErrorHandler("Course not found", 404));

  course.views += 1;

  await course.save();

  const lecturesCount = course.lectures.length;

  res.status(200).json({
    success: true,
    lecturesCount: lecturesCount,
    lectures: course.lectures,
  });
});

//add lecture(max video size 100MB)
export const addLecture = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;

  //const file = req.file;

  const course = await courseDetails.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const file = req.files["file"][0];
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });
  const myCloudAssignment = await cloudinary.v2.uploader.upload(
    assignmentUri ? assignmentUri.content : null
  );
  course.lectures.push({
    title,
    description,
    videos: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  course.numOfVideos = course.lectures.length;
  await course.save();

  res.status(200).json({
    success: true,
    message: "Lectures added in Course",
  });
});

// update lecture
export const updateLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;
  const { title, description } = req.body;

  const course = await courseDetails.findById(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });
  // Update lecture with new data..
  if (title) {
    lecture.title = title;
  }

  if (description) {
    lecture.description = description;
  }

  if (req.files && req.files["file"]) {
    const file = req.files["file"][0];
    const fileUri = getDataUri(file);
    await cloudinary.v2.uploader.destroy(lecture.videos.public_id, {
      resource_type: "video",
    });
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });
    lecture.videos = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }


  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture updated successfully",
  });
});

//update course
export const updateCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    discountedPercent,
    basePrice,
    total_duration,
    numOfVideos,
  } = req.body;

  const course = await courseDetails.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  if (req.files && req.files["file"]) {
    const file = req.files["file"][0];
    const fileUri = getDataUri(file);
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    course.poster = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  title ? (course.title = title) : null;
  description ? (course.description = description) : null;
  category ? (course.category = category) : null;
  discountedPercent ? (course.discountedPercent = discountedPercent) : null;
  basePrice ? (course.basePrice = basePrice) : null;
  total_duration ? (course.total_duration = total_duration) : null;
  numOfVideos ? (course.numOfVideos = numOfVideos) : null;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
  });
});

//delete course
export const deleteCourse = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const course = await courseDetails.findById(id);
  if (!course) return next(new ErrorHandler("Course not found", 404));

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.videos.public_id, {
      resource_type: "video",
    });
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

//delete lecture
export const deleteLecture = catchAsyncError(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await courseDetails.findById(courseId);
  if (!course) return next(new ErrorHandler("Course not found", 404));
  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) return item;
  });

  await cloudinary.v2.uploader.destroy(lecture.videos.public_id, {
    resource_type: "video",
  });
  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) return item;
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture deleted successfully",
  });
});


// Send list of registered courses
export const sendRegisteredCourses = catchAsyncError(async (req, res, next) => {
  const playlist = req.playlistData;

  const courseIds = playlist.map((item) => item.course);

  const courses = await courseDetails.find({ _id: { $in: courseIds } });

  const coursePlaylist = playlist.map((item) => {
    const courseDetails = courses.find((course) =>
      course._id.equals(item.course)
    );
    return { ...item._doc, course: courseDetails };
  });
  if (coursePlaylist.length === 0)
    return next(new ErrorHandler("No course found in playlist", 404));
  res.status(200).json({
    success: true,
    courses: coursePlaylist,
  });
});
