import { Request, Response } from "express";
import Coupon from "../model/coupon";
import mongoose from "mongoose";

const createCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error: any) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Unique coupon is required" });
    }
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const coupon = await Coupon.find();
    res.status(200).json(coupon);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params;
    const isValidId = mongoose.isValidObjectId(couponId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid coupon id" });
    }
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    const { name, expiration, discount } = req.body;
    coupon.name = name;
    coupon.expiration = expiration;
    coupon.discount = discount;
    const updatedCoupon = await coupon.save();
    res.status(200).json(updatedCoupon);
  } catch (error: any) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Unique coupon is required" });
    }
    res.status(500).json({ message: "Failed to update  coupon" });
  }
};

const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { couponId } = req.params;
    const isValidId = mongoose.isValidObjectId(couponId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid coupon id" });
    }
    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: "Failed to update  coupon" });
  }
};

export default { createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
