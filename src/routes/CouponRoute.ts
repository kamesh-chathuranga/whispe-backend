import express from "express";
import { hasAdminRole, jwtParse } from "../middleware/auth/auth";
import { validateCreateCouponRequest } from "../middleware/validation/coupon";
import CouponController from "../controller/CouponController";

const router = express.Router();

router.post(
  "/",
  jwtParse,
  hasAdminRole,
  validateCreateCouponRequest,
  CouponController.createCoupon
);

router.get("/", jwtParse, hasAdminRole, CouponController.getAllCoupons);

router.put(
  "/:couponId",
  jwtParse,
  hasAdminRole,
  validateCreateCouponRequest,
  CouponController.updateCoupon
);

router.delete(
  "/:couponId",
  jwtParse,
  hasAdminRole,
  CouponController.deleteCoupon
);

export default router;
