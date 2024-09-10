import express from "express";
import { hasAdminRole, jwtParse } from "../middleware/auth/auth";
import CategoryController from "../controller/CategoryController";
import { validateCreateCategoryRequest } from "../middleware/validation/category";

const router = express.Router();

router.post(
  "/",
  jwtParse,
  hasAdminRole,
  validateCreateCategoryRequest,
  CategoryController.createCategory
);

router.put(
  "/:categoryId",
  jwtParse,
  hasAdminRole,
  validateCreateCategoryRequest,
  CategoryController.updateCategory
);

router.delete(
  "/:categoryId",
  jwtParse,
  hasAdminRole,
  CategoryController.deleteCategory
);

router.get("/:categoryId", CategoryController.getCategory);

router.get("/", CategoryController.getAllCategory);

export default router;
