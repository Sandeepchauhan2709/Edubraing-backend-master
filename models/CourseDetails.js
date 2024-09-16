import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please Enter course title"],
    minLength: [4, "Title must be at least 4 charachters"],
    maxLength: [80, "Title can't exceed 80 charachters"],
  },
  description: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [20, "title must be at least 20 charachters"],
  },
  lectures: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      videos: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  discountedPercent: {
    type: Number,
    required: true,
  },
  total_duration: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  ],
});

export const courseDetails = mongoose.model('CourseDetails', schema);
