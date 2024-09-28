import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLectures: [{
    type: Number
  }],
  lastLecture:{
    type: Number,
    default: 0
  },
  lectureProgress: [{
    lectureNo: {
      type: Number,
      required: true
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: true
});

export const Progress = mongoose.model('Progress', ProgressSchema);