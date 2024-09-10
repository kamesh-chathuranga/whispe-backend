import express from "express";
import { hasAdminRole, jwtParse } from "../middleware/auth/auth";
import ProductController from "../controller/ProductController";
import {
  validateCreateProductRequest,
  validateUpdateProductRequest,
} from "../middleware/validation/product";

const router = express.Router();

router.post(
  "/",
  jwtParse,
  hasAdminRole,
  validateCreateProductRequest,
  ProductController.createProduct
);

router.get("/:productId", ProductController.getProductById);

router.get("/", ProductController.getAllProducts);

router.put(
  "/:productId",
  jwtParse,
  hasAdminRole,
  validateUpdateProductRequest,
  ProductController.updateProductById
);

router.delete(
  "/:productId",
  jwtParse,
  hasAdminRole,
  ProductController.deleteProductById
);

// Testing ...
router.post("/all", ProductController.createAllProduct);
export default router;
