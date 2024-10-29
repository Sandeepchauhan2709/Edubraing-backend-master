import mongoose from "mongoose";

const courseDetailsSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, "Please enter course title"],
    minLength: [4, "Title must be at least 4 characters"],
    maxLength: [80, "Title can't exceed 80 characters"]
    
  },
  description: {
    type: String,
    required: [true, "Please enter course description"],
    minLength: [20, "Description must be at least 20 characters"]
  },
  slug: {
    type: String,
    unique: true,
    sparse: true  // This allows null values and only enforces uniqueness on non-null values
  },
  poster: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  discountedPercent: {
    type: Number,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  total_duration: {
    type: String,
    required: true
  },
  numOfVideos: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting sections and lectures
courseDetailsSchema.virtual('content', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignments
courseDetailsSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: 'courseId',
  foreignField: 'courseId'
});

// Pre-save middleware to update numOfVideos and set slug
courseDetailsSchema.pre('save', async function(next) {
  if (this.isModified('courseId') || this.isNew) {
    const course = await mongoose.model('Course').findById(this.courseId);
    if (course) {
      // Set numOfVideos
      if (course.sections && course.sections.length > 0) {
        const lastSection = course.sections[course.sections.length - 1];
        if (lastSection.section_lectures && lastSection.section_lectures.length > 0) {
          const lastLecture = lastSection.section_lectures[lastSection.section_lectures.length - 1];
          this.numOfVideos = lastLecture.lecture_no;
        } else {
          this.numOfVideos = 0;
        }
      } else {
        this.numOfVideos = 0;
      }
      
      // Set slug
      this.slug = course.slug;
    } else {
      // If no associated course is found, set slug to null
      this.slug = null;
    }
  }
  next();
});

export const courseDetails = mongoose.model('CourseDetails', courseDetailsSchema);




// const initializeCourseDetails = async () => {
  
//   try {
//     await courseDetails.create({
//       courseId: new mongoose.Types.ObjectId("67193765385222a68f96d469"),
//       title: "Machine Learning",
//       description: "Comprehensive course covering fundamentals of Machine Learning including supervised, unsupervised, semi-supervised learning, and reinforcement learning. Learn essential ML workflows and practical applications.",

//       poster: {
//         public_id: "machine_learning_poster",
//         url: "https://www.fsm.ac.in/blog/wp-content/uploads/2022/08/ml-e1610553826718.jpg"
//       },
//       category: "technical",
//       basePrice: 1299,
//       discountedPercent: 20,
//       total_duration: "13h 36m"
//     });
//     console.log("CourseDetails initialized successfully.");
//   } catch (error) {
//     console.error("Error initializing CourseDetails:", error);
//   }
// };

// initializeCourseDetails();