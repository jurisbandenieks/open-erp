import { Router } from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
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

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * GET /users
 * Paginated, filterable list — no relations populated.
 * Query params: page, limit, role, status, search
 */
router.get(
  "/",
  validate(listUsersQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const result = await getUsers(req.query as never);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /users/:id
 * Single user with populated employee, manager, and owner profiles.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const data = await getUserById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /users
 * Create a new user. Admin only.
 */
router.post(
  "/",
  authorize("admin"),
  validate(createUserSchema),
  async (req, res, next) => {
    try {
      const data = await createUser(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /users/:id
 * Full update of user fields (password excluded). Admin only.
 */
router.put(
  "/:id",
  authorize("admin"),
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const data = await updateUser(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /users/:id
 * Partial update of user fields (password excluded). Admin only.
 */
router.patch(
  "/:id",
  authorize("admin"),
  validate(updateUserSchema),
  async (req, res, next) => {
    try {
      const data = await updateUser(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /users/:id
 * Hard-delete user (cascades to employee / manager / owner). Admin only.
 */
router.delete("/:id", authorize("admin"), async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
