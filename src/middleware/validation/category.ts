import { body } from "express-validator";
import { handleValidationErrors } from "../util";

export const validateCreateCategoryRequest = [
  body("title")
    .isString()
    .trim()
    .notEmpty()
    .not()
    .isNumeric()
    .withMessage("Valid Category required"),
  handleValidationErrors,
];
