import { Request, Response } from "express";
import Category from "../model/category";
import mongoose from "mongoose";

const createCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const isValidId = mongoose.isValidObjectId(categoryId);

    if (!isValidId) {
      return res.status(401).json({ message: "Invalid category id" });
    }
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const { title } = req.body;
    category.title = title;
    const savedCategory = await category.save();
    res.status(200).json(savedCategory);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const isValidId = mongoose.isValidObjectId(categoryId);

    if (!isValidId) {
      return res.status(401).json({ message: "Invalid category id" });
    }
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

const getCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const isValidId = mongoose.isValidObjectId(categoryId);

    if (!isValidId) {
      return res.status(401).json({ message: "Invalid category id" });
    }
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

const getAllCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.find();

    // if (!category) {
    //   return res.status(404).json({ message: "Category not found" });
    // }

    res.status(200).json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export default {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};
