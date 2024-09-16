import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Assignment } from "../models/Assignment.js";
import { Course } from "../models/Course.js";
import { Submissions } from "../models/Submission.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import { uploadFile, deleteFile, getSignedURL } from "../utils/fileStorage.js";

//get all  Assignments--user for his enrolled courses
export const getAllAssignments = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  const coursesId = user?.playlist?.map((course) => {
    return course.course;
  });

  let assignments = [];

  if (!coursesId || coursesId.length === 0) {
    return res.status(200).json({
      success: true,
      assignments,
    });
  }

  assignments = await Promise.all(
    coursesId.map(async (courseId) => {
      const assignment = {};
      const course = await Course.findById(courseId);
      assignment.course = {
        id: course._id,
        title: course.title,
      };

      const assignments = await Assignment.find({ courseId });
      const submissions = await Submissions.findOne({
        userId: req.user._id.toString(),
      });

      const userSubmissions = submissions?.courses.get(courseId)?.assignments;

      assignment.assignments = assignments.map((assignment) => {
        const submission = userSubmissions?.get(
          assignment._id.toString()
        )?.solutions;

        const questions = assignment.questions.map((question, index) => {
          const userAnswer = submission?.find(
            (sol) => sol.questionIndex === index
          );
          return {
            question,
            status: userAnswer?.submissionStatus,
          };
        });

        let status = null;
        if (questions.every((q) => q.isSubmitted && q.isVerified)) {
          status = "Completed";
        } else if (questions.some((q) => q.isSubmitted)) {
          status = "Submitted";
        } else {
          status = "Pending";
        }

        return {
          ...assignment._doc,
          questions,
          assignmentStatus: status,
        };
      });

      return assignment;
    })
  );

  return res.status(200).json({
    success: true,
    assignments,
  });
});

// get user assignments by courseId
export const getAssignmentsByCourseId = catchAsyncError(
  async (req, res, next) => {
    const assignments = await Assignment.find({ courseId: req.params.id });

    const submissions = await Submissions.findOne({
      userId: req.user._id.toString(),
    });

    const userSubmissions = submissions?.courses.get(
      req.params.id
    )?.assignments;

    if (!submissions || !userSubmissions) {
      return res.status(200).json({
        success: true,
        assignments,
        message: "No submissions found",
      });
    }

    res.status(200).json({
      success: true,
      assignments: assignments.map((assignment) => {
        const submission = userSubmissions.get(
          assignment._id.toString()
        )?.solutions;

        const questions = assignment.questions.map((question, index) => {
          const userAnswer = submission?.find(
            (sol) => sol.questionIndex === index
          );
          return {
            question,
            isSubmitted: Boolean(userAnswer), // if user has submitted the answer
            status: userAnswer?.submissionStatus,
            isVerified: userAnswer?.isVerified,
          };
        });

        let status = null;
        if (questions.every((q, i) => q.isSubmitted && q.isVerified)) {
          status = "Completed";
        } else if (questions.some((q, i) => q.isSubmitted)) {
          status = "Submitted";
        } else {
          status = "Pending";
        }

        return {
          ...assignment._doc,
          questions,
          assignmentStatus: status,
        };
      }),
    });
  }
);

//create Assignment
export const createAssignment = catchAsyncError(async (req, res, next) => {
  const { assignment_name, questions, courseId } = req.body;
  if (!assignment_name || !questions || !courseId)
    return next(new ErrorHandler("Please add all fields", 400));

  const file = req.files["file"] ? req.files["file"][0] : null;
  const uniqueFilename = file ? `${Date.now()}_${file.originalname}` : null;
  const s3Response = file
    ? await uploadFile({ ...file, filename: uniqueFilename }, "assignments")
    : null;

  const assignment = await Assignment.create({
    assignment_name,
    questions,
    courseId,
    file_details: file
      ? {
          fileName: file.originalname,
          fileSize: file.size,
          fileKey: `assignments/${uniqueFilename}`,
          fileUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/assignments/${uniqueFilename}`,
        }
      : null,
  });

  await assignment.save();
  await Course.findByIdAndUpdate(courseId, {
    $push: { assignments: assignment._id },
  });

  res.status(201).json({
    success: true,
    message: "Assignment created successfully.",
  });
});

export const getAssignment = catchAsyncError(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return next(new ErrorHandler("Assignment not found", 404));

  const submissions = await Submissions.findOne({
    userId: req.user._id.toString(),
  });

  const userSubmissions = submissions?.courses.get(
    assignment.courseId.toString()
  )?.assignments;

  let questions = assignment.questions;

  if (submissions && userSubmissions) {
    const submission = userSubmissions.get(
      assignment._id.toString()
    )?.solutions;

    questions = assignment.questions.map((question, index) => {
      const userAnswer = submission?.find((sol) => sol.questionIndex === index);
      return {
        question,
        status: userAnswer?.submissionStatus,
        solutionId: userAnswer?._id,
        feedback: userAnswer?.feedback ?? "No feedback provided",
      };
    });
  } else {
    questions = questions.map((question) => {
      return {
        question,
        isSubmitted: false,
      };
    });
  }

  const url = assignment.file_details.fileKey
    ? await getSignedURL(assignment.file_details.fileKey)
    : null;
  assignment.file_details.fileUrl = url;

  res.status(200).json({
    success: true,
    assignment: {
      ...assignment._doc,
      questions,
    },
  });
});

//delete Assignment
export const deleteAssignment = catchAsyncError(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return next(new ErrorHandler("Assignment not found", 404));
  assignment.file_details.fileKey &&
    (await deleteFile(assignment.file_details.fileKey));
  await assignment.deleteOne();

  // also delete the assignment from the course
  await Course.findByIdAndUpdate(assignment.courseId, {
    $pull: { assignments: assignment._id },
  });

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully",
  });
});

//update Assignment
export const updateAssignment = catchAsyncError(async (req, res, next) => {
  const { assignment_name, questions } = req.body;

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return next(new ErrorHandler("Assignment not found", 404));

  if (assignment_name) {
    assignment.assignment_name = assignment_name;
  }
  if (questions) {
    assignment.questions = questions;
  }

  if (!req.files || !req.files["file"]) {
    await assignment.save();
    res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
    });
  }
  assignment.file_details.fileKey &&
    (await deleteFile(assignment.file_details.fileKey));
  const file = req.files["file"][0];
  const uniqueFilename = `${Date.now()}_${file.originalname}`;
  const s3Response = await uploadFile(
    { ...file, filename: uniqueFilename },
    "assignments"
  );
  assignment.file_details = {
    fileName: file.originalname,
    fileSize: file.size,
    fileKey: `assignments/${uniqueFilename}`,
    fileUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/assignments/${uniqueFilename}`,
  };
  await assignment.save();
  res.status(200).json({
    success: true,
    message: "Assignment updated successfully",
  });
});
