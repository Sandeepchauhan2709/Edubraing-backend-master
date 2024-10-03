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





// ----------------------------------------------------------------
// IMPORTANT NOTE:


// When you need full course information, you can populate the content and assignments virtual fields.

// Example usage:
// javascriptCopyconst courseDetails = await CourseDetails.findOne({ courseId: someId })
//   .populate('content')
//   .populate('assignments');

// console.log(courseDetails.content.sections); // Access course sections
// console.log(courseDetails.assignments); // Access course assignments


// import mongoose from "mongoose";






// for inserting and testing is the below code 


// async function createCourseDetails() {
//   const courseId = "66c8a181a5a819dd5095d91c";

//   const courseDetailsData = {
//     courseId: courseId,
//     title: "Power BI",
//     description: "Comprehensive course on Power BI for data analysis and visualization",
//     poster: {
//       public_id: "power_bi_poster",
//       url: "https://www.excelptp.com/wp-content/uploads/2021/05/power-bi-training-banner-img.jpg"
//     },
//     category: "technical",
//     basePrice: 99.99,
//     discountedPercent: 20,
//     views: 0,
//     total_duration: "10h 30m"
//   };

//   try {
//     const courseDetail = new courseDetails(courseDetailsData);
//     await courseDetail.save();
//     console.log("CourseDetails created successfully:", courseDetail);
//   } catch (error) {
//     console.error("Error creating CourseDetails:", error);
//   }
// }

// createCourseDetails();






// ----------------------------------------------------------------
// IMPORTANT NOTE:


// When you need full course information, you can populate the content and assignments virtual fields.

// Example usage:
// javascriptCopyconst courseDetails = await CourseDetails.findOne({ courseId: someId })
//   .populate('content')
//   .populate('assignments');

// console.log(courseDetails.content.sections); // Access course sections
// console.log(courseDetails.assignments); // Access course assignments


// import mongoose from "mongoose";