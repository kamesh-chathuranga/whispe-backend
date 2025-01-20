import { Request, Response } from "express";
import Product from "../model/product";
import slugify from "slugify";
import mongoose from "mongoose";

const createProduct = async (req: Request, res: Response) => {
  try {
    const createdProduct = new Product(req.body);
    createdProduct.slug = await generateSlug(req.body.title);
    await createdProduct.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

const createAllProduct = async (req: Request, res: Response) => {
  try {
    for (const element of req.body) {
      const createdProduct = new Product(element);
      createdProduct.slug = await generateSlug(element.title);
      await createdProduct.save();
    }

    res.status(201).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create products" });
  }
};

const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get product" });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get products" });
  }
};

const updateProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.body.title) {
      updatedProduct.slug = await generateSlug(req.body.title);
    }
    await updatedProduct.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

const deleteProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

const rateProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { rate, productId, comment } = req.body;
    const isValidId = mongoose.isValidObjectId(productId);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const alreadyRated = product.rating.find(
      (rate) => rate.postBy?.toString() === userId
    );
    let ratedProduct;

    if (alreadyRated) {
      ratedProduct = await Product.updateOne(
        { rating: { $elemMatch: alreadyRated } },
        { $set: { "rating.$.star": rate, "rating.$.comment": comment } },
        { new: true }
      );
    } else {
      ratedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: { rating: { star: rate, comment, postBy: userId } },
        },
        { new: true }
      );
    }

    const updatedProduct = await Product.findById(productId);

    if (!updatedProduct) {
      return;
    }
    const totalRates = updatedProduct.rating.length;
    const sumOfRates = totalRates
      ? updatedProduct.rating
          .map((rate) => rate.star)
          .reduce((prev, curr) => (prev ?? 0) + (curr ?? 0), 0)
      : 0;

    updatedProduct.avarageRate = parseFloat(
      ((sumOfRates ?? 0) / totalRates).toFixed(1)
    );

    const savedProduct = await updatedProduct.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to rate product" });
  }
};

const generateSlug = async (title: string) => {
  let slug = slugify(title, { lower: true, strict: true, locale: "en" });
  let existingProduct = await Product.findOne({ slug });
  let counter = 1;

  while (existingProduct) {
    slug = `${slug}-${counter}`;
    existingProduct = await Product.findOne({ slug });
    counter++;
  }
  return slug;
};

export default {
  createProduct,
  getProductById,
  getAllProducts,
  updateProductById,
  deleteProductById,
  createAllProduct,
  rateProduct,
};
