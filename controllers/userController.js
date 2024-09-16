import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";

//register
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return next(new ErrorHandler("Please enter all filed"), 400);

  if (password != confirmPassword)
    return next(
      new ErrorHandler("Password and Confirm password is not matching"),
      400
    );

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  user = await User.create({
    name,
    email,
    password,
  });

  const OTP = user.generateOTP();
  await user.save();


  console.log(OTP);
  const message = `Your OTP is ${OTP.code}, It will Expire in 10 minutes`;
  await sendEmail(user.email, "Edubrain Verification OTP", message);
  console.log(message);
  res.status(201).json({
    success: true,
    message: "Pending Verification, We have sent you an OTP to your email",
  });

});

//VerifyOTP
export const  otpVerification = catchAsyncError(async (req, res, next) => {
  const { email, OTP } = req.body;

  if (!email || !OTP) return next(new ErrorHandler("Please enter all filed"), 400);

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User Not Found", 404));
  if (user.otp.expirationTime < Date.now()) return next(new ErrorHandler("OTP has expired", 400));
  if (user.otp.code !== OTP) return next(new ErrorHandler("Invalid OTP", 400));

  user.otp.code = null;
  user.otp.expirationTime = null;
  await user.save();

  sendToken(res, user, "Registered Successfully", 201);
});

// Deleting Users with expired OTP
export const deleteUsersWithExpiredOTP = catchAsyncError(async () => {
  try {
      const currentTime = Date.now();
      await User.deleteMany({
          'otp.expirationTime': { $lte: currentTime }, // Sort Users with expired OTP
          'otp.code': { $ne: null }, // Excluding Users with OTP verified
      });
  } catch (error) {
      console.error('Error deleting users with expired OTP:', error);
  }
});

//login
export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter all filed"), 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 400));
  if (user.otp.code !== null) return next(new ErrorHandler("Please Verify OTP", 400));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 400));


  sendToken(res, user, `Welcome back ${user.name}`, 201);
});

//logout
export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure:true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

// Function to send registered courses list
export const getRegisteredCourses = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  req.playlistData = user.playlist;

  next();
});

//get my profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

//change passowrd
export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword)
    return next(new ErrorHandler("Please enter password", 400));

  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

  if (newPassword != confirmPassword)
    return next(new ErrorHandler("Password doesn't match", 400));

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

//update profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});

//forgot password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User Not Found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password.${url}. if you have not requested than please ignore`;

  await sendEmail(user.email, "Edubrain Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token Has Been sent To ${user.email}`,
  });
});

//reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorHandler("Token is Invalid or has been Expired"));

  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(new ErrorHandler("Please Enter all field", 400));

  if (password != confirmPassword)
    return next(
      new ErrorHandler("Password and Confirm password is not matching"),
      400
    );

  user.password = password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed Successfully",
  });
});

//Add to favourite
// export const addToFavourite = catchAsyncError(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   const course = await Course.findById(req.body.id);

//   if (!course)
//     return next(new ErrorHandler("Invalid Course or Course not found", 404));

//   const itemExist = user.favourite.find((item) => {
//     if (item.course.toString() === course._id.toString()) return true;
//   });

//   if (itemExist)
//     return next(new ErrorHandler("Already Added to Favourite", 409));

//   user.favourite.push({
//     course: course._id,
//     poster: course.poster.url,
//   });

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Added to Favourite",
//   });
// });

// //Delete from favourite
// export const removeFromFavourite = catchAsyncError(async (req, res, next) => {
//   const user = await User.findById(req.user._id);

//   const course = await Course.findById(req.query.id);

//   if (!course)
//     return next(new ErrorHandler("Invalid course ID or course not found", 404));

//   const newFavourite = user.favourite.filter((item) => {
//     if (item.course.toString() !== course._id.toString()) return item;
//   });

//   user.favourite = newFavourite;
//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Removed From Favourite",
//   });
// });

//get All users --Admin
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//update user role--Admin
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

//delete User
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  // await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

