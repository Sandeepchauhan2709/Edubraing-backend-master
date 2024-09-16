import mongoose from "mongoose";

const schema = new mongoose.Schema({
  assignment_name: {
    type: String,
    required: true,
  },
  questions: [String],
  file_details: {
    fileName: String,
    fileSize: Number,
    fileKey: String,
    fileUrl: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

export const Assignment = mongoose.model("Assignment", schema);
