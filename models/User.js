import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const defaultAvatarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
</svg>
`;

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your Name"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be at least 6 character"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  isAuthorize: {
    type: String,
    default: "",
  },
  avatar: {
    public_id: {
      type: String,
      default: 'default_avatar',
    },
    url: {
      type: String,
      default: `data:image/svg+xml,${encodeURIComponent(defaultAvatarSvg)}`,
    },
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  otp: {
    code: {
      type: String,
      default: null,
    },
    expirationTime: {
      type: Date,
      default: null,
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

schema.methods.generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000);
  this.otp = {
    code: otp,
    expirationTime: Date.now() + 10 * 60 * 1000,
  };
  return this.otp;
};

schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", schema);
// import mongoose from "mongoose";
// import validator from "validator";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import crypto from "crypto";

// const schema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please Enter your Name"],
//   },
//   email: {
//     type: String,
//     required: [true, "Please Enter your email"],
//     unique: true,
//     validate: validator.isEmail,
//   },
//   password: {
//     type: String,
//     required: [true, "Please enter your password"],
//     minLength: [6, "Password must be at least 6 character"],
//     select: false,
//   },
//   role: {
//     type: String,
//     enum: ["admin", "user"],
//     default: "user",
//   },
//   isAuthorize: {
//     type: String,
//     default: "",
//   },
//   avatar: {
//     public_id: {
//       type: String,
//     },
//     url: {
//       type: String,
//     },
//   },
//   playlist: [
//     {
//       course: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Course",
//       },
//       // This will contain the lecture ID Upto which user can access acc to current assignment submissions
//       lectureId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Course.lectures",
//         default: 0,
//       },
//       poster: String,
//     },
//   ],
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   otp: {
//     code: {
//       type: String,
//       default: null,
//     },
//     expirationTime: {
//       type: Date,
//       default: null,
//     },
//   },
//   resetPasswordToken: String,
//   resetPasswordExpire: String,
// });

// schema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// schema.methods.getJWTToken = function () {
//   return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
//     expiresIn: "15d",
//   });
// };

// schema.methods.generateOTP = function () {
//   const otp = Math.floor(1000 + Math.random() * 9000);
//   this.otp = {
//     code: otp,
//     expirationTime: Date.now() + 10 * 60 * 1000,
//   };
//   return this.otp;
// };

// schema.methods.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// schema.methods.getResetToken = function () {
//   const resetToken = crypto.randomBytes(20).toString("hex");
//   this.resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//   return resetToken;
// };

// export const User = mongoose.model("User", schema);
