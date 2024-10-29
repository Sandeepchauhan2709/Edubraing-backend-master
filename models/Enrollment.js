import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetails',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  currency :{
    type: String,
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only enroll once in a course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

