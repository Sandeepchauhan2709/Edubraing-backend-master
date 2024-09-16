// models/CourseProgress.js
// const mongoose = require('mongoose');
import mongoose from 'mongoose';


const ProgressSchema = new mongoose.Schema({
    userId: { 
      type: String, 
      required: true 
    },
    courseId: { 
      type: String, 
      required: true 
    },
    progress: [
      {
        section_no: { 
          type: Number, 
          required: true 
        },
        lecture_no: { 
          type: Number, 
          
          required: true },
        timeSpent: { 
          type: Number, 
          default: 0 
        }, // Time spent in seconds
        completed: { 
          type: Boolean, 
          default: false },
      }
    ],
    courseCompleted: { 
      type: Boolean, 
      
      default: false }, // Is the entire course completed?
  }, 
  { 
    timestamps: true 
  });
export const Progress = mongoose.model('Progress', ProgressSchema);
