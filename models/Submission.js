import mongoose from "mongoose";

// Solution Schema
const solutionSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  solutionLink: {
    type: String,
  },
  solutionText: {
    type: String,
  },
  solutionFile: {
    fileFolder: String,
    fileName: String,
    baseUrl: String,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  submissionStatus: {
    type: String,
    enum: ["Submitted", "Approved", "Rejected"],
    default: "Submitted",
  },
  feedback: {
    type: String,
  },
});

// Assignment Schema
const assignmentSchema = new mongoose.Schema({
  assignmentId: {
    type: String,
    required: true,
  },
  solutions: [solutionSchema],
});

// Course Schema
const courseSchema = new mongoose.Schema({
  assignments: {
    type: Map,
    of: assignmentSchema,
  },
});

// Submission Schema
const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  courses: {
    type: Map,
    of: courseSchema,
  },
});

// Create and export the model
export const Submissions = mongoose.model("Submission", submissionSchema);
