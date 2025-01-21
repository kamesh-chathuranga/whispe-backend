// import express from "express";
// import UserController from "../controller/UserController";
// import {
//   validateForgotPasswordRequest,
//   validateResetPasswordRequest,
//   validateUpdatePasswordRequest,
//   validateUserUpdateRequest,
// } from "../middleware/validation/user";
// import { jwtParse } from "../middleware/auth/auth";

// const router = express.Router();

// router.get("/", jwtParse, UserController.getCurrentUser);

// router.delete("/", jwtParse, UserController.deleteCurrentUser);

// router.put(
//   "/",
//   jwtParse,
//   validateUserUpdateRequest,
//   UserController.updateCurrentUser
// );

// router.put(
//   "/password",
//   jwtParse,
//   validateUpdatePasswordRequest,
//   UserController.updateUserPassword
// );

// router.post(
//   "/forgot-password",
//   jwtParse,
//   validateForgotPasswordRequest,
//   UserController.forgotPassword
// );

// router.post(
//   "/reset-password/:token",
//   jwtParse,
//   validateResetPasswordRequest,
//   UserController.resetPassword
// );

// router.put("/wishlist", jwtParse, UserController.addToWhishlist);

// export default router;
