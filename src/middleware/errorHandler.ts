import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(401).json({ message: error.array() });
  }
  next();
};
