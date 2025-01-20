import { body } from "express-validator";
import { handleValidationErrors } from "../util";

export const validateCreateCouponRequest = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Valid coupon name required"),
  body("expiration").isDate().withMessage("Valid expiration date required"),
  body("discount").isFloat({ gt: 0 }).withMessage("Valid discount required"),
  handleValidationErrors,
];
