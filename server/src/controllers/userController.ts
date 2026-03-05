import type { Request, Response, NextFunction } from "express";
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../services/userService";
import { validate } from "../middleware/validate";

export const listUsers = [
  validate(listUsersQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getUsers(req.query as never);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getUserById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const createUserHandler = [
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await createUser(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const updateUserHandler = [
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await updateUser(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
] as const;

export const removeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
