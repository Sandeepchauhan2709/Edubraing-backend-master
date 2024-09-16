import express from "express";
import {
  changePassword,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getMyProfile,
  login,
  logout,
  register,
  otpVerification,
  resetPassword,
  updateProfile,
  updateUserRole,
  deleteUsersWithExpiredOTP,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

//register
router.route("/register").post(register);

//VerifyOTP
router.route("/verifyOTP").post(otpVerification);

//login
router.route("/login").post(login);

//logout
router.route("/logout").get(logout);

//get my profile
router.route("/me").get(isAuthenticated, getMyProfile);

//change password
router.route("/changepassword").put(isAuthenticated, changePassword);

//update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

//forgot password
router.route("/forgotpassword").post(forgotPassword);

//reset password
router.route("/resetpassword/:token").put(resetPassword);

// //Add to favourite
// router.route("/addtofavourite").post(isAuthenticated, addToFavourite);

// //remove from favourite
// router
//   .route("/removeFromFavourite")
//   .delete(isAuthenticated, removeFromFavourite);

//Get All Users---Admin
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers);

// Delete users with expired OTP
setInterval(deleteUsersWithExpiredOTP, 60 * 1000);
//update user role -Admin
router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser);

export default router;
