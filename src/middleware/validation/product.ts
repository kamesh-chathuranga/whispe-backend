import { body } from "express-validator";
import { handleValidationErrors } from "../util";

export const validateCreateProductRequest = [
  body("title")
    .isString()
    .withMessage("Title should be a string")
    .trim()
    .notEmpty()
    .withMessage("Title is rquired")
    .not()
    .isNumeric()
    .withMessage("Valid title required"),

  body("description")
    .isString()
    .withMessage("Description should be a string")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .not()
    .isNumeric()
    .withMessage("Valid description required"),

  body("price")
    .isCurrency({ allow_decimal: true, allow_negatives: false })
    .withMessage("Valid price required"),

  body("brand")
    .isString()
    .withMessage("Brand should be a string")
    .trim()
    .notEmpty()
    .withMessage("Brand is required"),

  body("quantity").isInt({ min: 1 }).withMessage("Valid quantity is required"),

  body("sold")
    .optional()
    .isInt()
    .withMessage("Valid number of sold items required"),

  body("color").optional().isArray().notEmpty(),
  body("color.*")
    .isString()
    .withMessage("Colors should be string")
    .not()
    .isNumeric()
    .withMessage("Valid colors required"),

  body("rating").optional().isArray(),
  body("rating.*.star").isInt({ min: 0 }).withMessage("Valid rate required"),
  handleValidationErrors,
];

export const validateUpdateProductRequest = [
  body("title")
    .optional()
    .isString()
    .withMessage("Title should be a string")
    .trim()
    .notEmpty()
    .withMessage("Title is rquired")
    .not()
    .isNumeric()
    .withMessage("Valid title required"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description should be a string")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .not()
    .isNumeric()
    .withMessage("Valid description required"),

  body("price")
    .optional()
    .isCurrency({ allow_decimal: true, allow_negatives: false })
    .withMessage("Valid price required"),

  body("brand")
    .optional()
    .isString()
    .withMessage("Brand should be a string")
    .trim()
    .notEmpty()
    .withMessage("Brand is required"),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Valid quantity is required"),

  body("sold")
    .optional()
    .optional()
    .isInt()
    .withMessage("Valid number of sold items required"),

  body("color").optional().isArray().notEmpty(),
  body("color.*")
    .isString()
    .withMessage("Colors should be string")
    .not()
    .isNumeric()
    .withMessage("Valid colors required"),

  body("rating").optional().isArray(),
  body("rating.*.star").isInt({ min: 0 }).withMessage("Valid rate required"),
  handleValidationErrors,
];
