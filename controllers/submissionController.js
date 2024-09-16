import { Submissions } from "../models/Submission.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { uploadFile, deleteFile, getSignedURL } from "../utils/fileStorage.js";

// Get all submissions or filter by user ID
export const getAllSubmissions = catchAsyncError(async (req, res, next) => {
  const { userId, courseId } = req.params;
  let query = {};
  if (userId) {
    query.userId = userId;
  }
  const users = await Submissions.find(query);

  res.status(200).json(users);
});

// Get a submission by ID (Specific Task) -- final
export const getSubmission = catchAsyncError(async (req, res, next) => {
  const { id: userId, courseId, assignmentId } = req.body;
  const submission = await Submissions.findOne({ userId });
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  const course = submission.courses.get(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found in this Submission", 404));
  }
  const assignment = course.assignments.get(assignmentId);
  if (!assignment) {
    return next(
      new ErrorHandler("Assignment not found in this Submission", 404)
    );
  }
  res.status(200).json({ assignment });
});

// Get a submission by Course ID -- final
export const getCourseSubmission = catchAsyncError(async (req, res, next) => {
  const { id: userId, courseId } = req.body;
  const submissions = await Submissions.findOne({ userId });
  if (!submissions) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  const course = submissions.courses.get(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found in this Submission", 404));
  }
  res.status(200).json({ course });
});

// Create a submission -- final
export const createSubmission = catchAsyncError(async (req, res, next) => {
  const { assignmentId, courseId, solutionLink, solutionText, questionIndex } =
    req.body;

  const id = req.user._id;
  const userId = id.toString();

  const file = req.files && req.files["file"] ? req.files["file"][0] : null;
  let fileDetails = null;

  let user = await Submissions.findOne({ userId });
  if (!user) {
    user = new Submissions({ userId, courses: new Map() });
  }

  if (!user.courses.has(courseId)) {
    user.courses.set(courseId, { assignments: new Map() });
  }
  const course = user.courses.get(courseId);

  if (!course.assignments.has(assignmentId)) {
    course.assignments.set(assignmentId, { assignmentId, solutions: [] });
  }
  const assignment = course.assignments.get(assignmentId);
  const existingSolution = assignment.solutions.find(
    (solution) => solution.questionIndex == questionIndex
  );
  if (existingSolution) {
    return next(
      new ErrorHandler("Solution with that index already exists", 400)
    );
  }

  if (file) {
    const uniqueFilename = `${Date.now()}_${file.originalname}`;
    const s3Response = await uploadFile(
      { ...file, filename: uniqueFilename },
      "solutions"
    );

    fileDetails = {
      fileName: uniqueFilename,
      fileFolder: `solutions/`,
      baseUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`,
    };
  }

  const newSolution = {
    questionIndex,
    solutionLink,
    solutionText,
    solutionFile: fileDetails,
  };
  assignment.solutions.push(newSolution);

  await user.save();
  res.status(201).json({
    message: "Submission added successfully",
    submission: newSolution,
  });
});

// Update a submission by ID
export const updateSubmission = catchAsyncError(async (req, res, next) => {
  const { courseId, assignmentId, solutionId } = req.body;
  const { id: userId } = req.user;
  const { solutionLink, solutionText } = req.body;
  const file = req.files && req.files["file"] ? req.files["file"][0] : null;
  let fileDetails = null;

  const users = await Submissions.findOne({ userId });

  const course = users.courses.get(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found in this Submission", 404));
  }
  const assignment = course.assignments.get(assignmentId);
  if (!assignment) {
    return next(
      new ErrorHandler("Assignment not found in this Submission", 404)
    );
  }

  const submission = assignment.solutions.id(solutionId);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  if (submission.solutionFile && submission.solutionFile.fileName) {
    await deleteFile(
      submission.solutionFile.fileFolder + submission.solutionFile.fileName
    );
  }
  if (file) {
    const uniqueFilename = `${Date.now()}_${file.originalname}`;
    const s3Response = await uploadFile(
      { ...file, filename: uniqueFilename },
      "solutions"
    );

    fileDetails = {
      fileName: uniqueFilename,
      fileFolder: `solutions/`,
      baseUrl: `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`,
    };

    if (submission.solutionFile && submission.solutionFile.fileName) {
      await deleteFile(
        submission.solutionFile.fileFolder + submission.solutionFile.fileName
      );
    }

    submission.solutionFile = fileDetails;
  }

  submission.solutionLink = solutionLink;
  submission.solutionText = solutionText;
  submission.submissionDate = Date.now();

  await users.save();
  res
    .status(200)
    .json({ message: "Submission updated successfully", submission });
});

// Delete a submission by IDd
export const deleteSubmission = catchAsyncError(async (req, res, next) => {
  const { id: userId, courseId, assignmentId, solutionId } = req.body;

  const users = await Submissions.findOne({ userId });

  const course = users.courses.get(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found in this Submission", 404));
  }
  const assignment = course.assignments.get(assignmentId);
  if (!assignment) {
    return next(
      new ErrorHandler("Assignment not found in this Submission", 404)
    );
  }

  const submission = assignment.solutions.id(solutionId);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }
  if (submission.solutionFile && submission.solutionFile.fileName) {
    await deleteFile(
      submission.solutionFile.fileFolder + submission.solutionFile.fileName
    );
  }
  assignment.solutions.pull(submission);
  await users.save();

  res.status(200).json({ message: "Submission deleted successfully" });
});
