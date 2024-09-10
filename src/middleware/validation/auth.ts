import { body } from "express-validator";
import { handleValidationErrors } from "../util";

export const validateUserLoginRequest = [
  body("email")
    .isString()
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];
