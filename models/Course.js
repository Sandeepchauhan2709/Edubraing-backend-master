import mongoose from "mongoose";
import {CloudLinkSchema} from "./CloudLinkSchema.js";

const Schema = mongoose.Schema;

const LectureSchema = new Schema({
    lecture_no: {type: Number, required: true},
    lecture_name: {type: String, required: true},
    lecture_cloud_link: CloudLinkSchema,
    lecture_file_path: {type: String, required: true}
});

const SectionSchema = new Schema({
    section_no: Number,
    section_name: {type: String, required: true},
    section_lectures: [LectureSchema],
});

const CourseSchema = new Schema({
  course_name: {type: String, required: true},
  sections: [SectionSchema],
  slug: {type: String, unique: true, required: true},
  courseDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetails'
  }
}, {
  timestamps: {
    createdAt: 'addDate',
    updatedAt: 'updatedAt'
  }
});

export const Course = mongoose.model('Course', CourseSchema);









