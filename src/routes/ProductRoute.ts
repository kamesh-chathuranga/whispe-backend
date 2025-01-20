import express from "express";
import multer from "multer";
import { hasAdminRole, jwtParse } from "../middleware/auth/auth";
import ProductController from "../controller/ProductController";
import {
  validateCreateProductRequest,
  validateProductRateRequest,
  validateUpdateProductRequest,
} from "../middleware/validation/product";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

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
  "/rate",
  jwtParse,
  validateProductRateRequest,
  ProductController.rateProduct
);

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

// Test ...
router.post("/all", ProductController.createAllProduct);
export default router;
