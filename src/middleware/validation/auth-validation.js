"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLoginRequest = exports.validateUserRegisterRequest = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../errorHandler");
exports.validateUserRegisterRequest = [
    (0, express_validator_1.body)("name")
        .isString()
        .withMessage("Name should be a string")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .not()
        .isNumeric()
        .withMessage("Name should not be a number"),
    (0, express_validator_1.body)("email")
        .isString()
        .withMessage("Email should be a string")
        .trim()
        .isEmail()
        .withMessage("Valid email is required"),
    (0, express_validator_1.body)("password")
        .isString()
        .withMessage("Password should be a string")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be at least 6 characters long"),
    errorHandler_1.handleValidationErrors,
];
exports.validateUserLoginRequest = [
    (0, express_validator_1.body)("email")
        .isString()
        .trim()
        .isEmail()
        .withMessage("Valid email is required"),
    (0, express_validator_1.body)("password")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Password is required"),
    errorHandler_1.handleValidationErrors,
];
