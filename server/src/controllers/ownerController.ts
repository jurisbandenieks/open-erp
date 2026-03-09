import type { Request, Response, NextFunction } from "express";
import {
  createOwnerSchema,
  updateOwnerSchema,
  createOwner,
  getOwners,
  getOwnerById,
  getOwnerByUserId,
  updateOwner,
  deleteOwner
} from "../services/ownerService";
import { validate } from "../middleware/validate";

export const listOwners = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const owners = await getOwners();
    res.json({ success: true, data: owners });
  } catch (err) {
    next(err);
  }
};

export const getOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const owner = await getOwnerById(req.params.id);
    res.json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
};

export const createOwnerHandler = [
  validate(createOwnerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await createOwner(req.body);
      res.status(201).json({ success: true, data: owner });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const updateOwnerHandler = [
  validate(updateOwnerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await updateOwner(req.params.id, req.body);
      res.json({ success: true, data: owner });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const removeOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteOwner(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const getMyOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const owner = await getOwnerByUserId(req.user!.userId);
    if (!owner) return res.status(404).json({ success: false, message: "Not an owner" });
    res.json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
};
