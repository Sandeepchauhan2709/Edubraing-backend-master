import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
    },
    url: {
      type: String,
    },
  },
  playlist: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      // This will contain the lecture ID Upto which user can access acc to current assignment submissions
      lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course.lectures",
        default: 0,
      },
      poster: String,
    },
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
