import { body } from "express-validator";
import { handleValidationErrors } from "../util";

export const validateGetUserRequest = [
  body("email")
    .isString()
    .withMessage("Email should be a string")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  handleValidationErrors,
];

// export const validateUserUpdateRequest = [
//   body("firstName")
//     .optional()
//     .isString()
//     .withMessage("First name should be a string")
//     .trim()
//     .notEmpty()
//     .withMessage("First name is required")
//     .not()
//     .isNumeric()
//     .withMessage("First name should not be a number"),
//   body("lastName")
//     .optional()
//     .isString()
//     .withMessage("Last name should be a string")
//     .trim()
//     .notEmpty()
//     .withMessage("Last name is required")
//     .not()
//     .isNumeric()
//     .withMessage("Last name should not be a number"),
//   body("email")
//     .optional()
//     .isString()
//     .withMessage("Email should be a string")
//     .trim()
//     .isEmail()
//     .withMessage("Valid email is required"),
//   body("mobile")
//     .optional()
//     .isString()
//     .withMessage("Mobile number should be a string")
//     .trim()
//     .isNumeric()
//     .isLength({ min: 10, max: 10 })
//     .withMessage("Valid mobile number is required"),
//   handleValidationErrors,
// ];

// export const validateUpdatePasswordRequest = [
//   body("currentPassword")
//     .isString()
//     .trim()
//     .notEmpty()
//     .withMessage("Currnet Password is required"),
//   body("newPassword")
//     .isString()
//     .trim()
//     .notEmpty()
//     .withMessage("New Password is required"),
//   handleValidationErrors,
// ];

// export const validateForgotPasswordRequest = [
//   body("email").isEmail(),
//   handleValidationErrors,
// ];

// export const validateResetPasswordRequest = [
//   body("newPassword")
//     .isString()
//     .trim()
//     .notEmpty()
//     .withMessage("New password is required"),
//   handleValidationErrors,
// ];
