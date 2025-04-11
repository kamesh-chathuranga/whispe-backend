import { body } from "express-validator";
import { handleValidationErrors } from "../errorHandler";

export const validateUserRegisterRequest = [
  body("name")
    .isString()
    .withMessage("Name should be a string")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .not()
    .isNumeric()
    .withMessage("Name should not be a number"),

  body("email")
    .isString()
    .withMessage("Email should be a string")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isString()
    .withMessage("Password should be a string")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 characters long"),
  handleValidationErrors,
];

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
