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


// db.enrollments.insertOne({
//   user: ObjectId("66ffbca9b47e1431024a0ecb"),
//   course: ObjectId("66c8a181a5a819dd5095d91c"),
//   courseDetails: ObjectId("66fe0033af7a46f6f6f70f4f"),
//   enrollmentDate: new Date("2024-10-05T10:00:00.000Z"),
//   paymentStatus: "completed",
//   paymentAmount: 99.99,
//   paymentMethod: "credit_card",
//   expirationDate: new Date("2025-10-05T10:00:00.000Z"),
//   isActive: true
// })

// {
//   "_id": {
//     "$oid": "66ffbca9b47e1431024a0ecb"
//   },
//   "name": "akhil",
//   "email": "anirudhrai503@gmail.com",
//   "password": "$2b$10$6nFr6AyyBYJaMXOb9jDdluNc/E1u.eQ3FmS2L28LHterpBXu0IfhS",
//   "role": "user",
//   "isAuthorize": "",
//   "avatar": {
//     "public_id": "default_avatar",
//     "url": "data:image/svg+xml,%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22currentColor%22%3E%0A%20%20%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M18.685%2019.097A9.723%209.723%200%200021.75%2012c0-5.385-4.365-9.75-9.75-9.75S2.25%206.615%202.25%2012a9.723%209.723%200%20003.065%207.097A9.716%209.716%200%200012%2021.75a9.716%209.716%200%20006.685-2.653zm-12.54-1.285A7.486%207.486%200%200112%2015a7.486%207.486%200%20015.855%202.812A8.224%208.224%200%200112%2020.25a8.224%208.224%200%2001-5.855-2.438zM15.75%209a3.75%203.75%200%2011-7.5%200%203.75%203.75%200%20017.5%200z%22%20clip-rule%3D%22evenodd%22%20%2F%3E%0A%3C%2Fsvg%3E%0A"
//   },
//   "enrolledCourses": [
//     {
//       "$oid": "66c8a181a5a819dd5095d91c"
//     }
//   ],
//   "otp": {
//     "code": null,
//     "expirationTime": null
//   },
//   "createdAt": {
//     "$date": "2024-10-04T10:00:09.464Z"
//   },
//   "__v": 0
// }