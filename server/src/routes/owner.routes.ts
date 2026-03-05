import {
  Router,
  type Request,
  type Response,
  type NextFunction
} from "express";
import { authenticate, authorize } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { UserRole } from "../entities/enums";
import {
  createOwnerSchema,
  updateOwnerSchema,
  createOwner,
  getOwners,
  getOwnerById,
  updateOwner,
  deleteOwner
} from "../services/ownerService";

const router = Router();

// All owner routes require authentication + sysadmin role
router.use(authenticate, authorize(UserRole.SYSADMIN));

/** GET /owners — list all owners */
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const owners = await getOwners();
    res.json({ success: true, data: owners });
  } catch (err) {
    next(err);
  }
});

/** GET /owners/:id — single owner with relations */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const owner = await getOwnerById(req.params.id);
    res.json({ success: true, data: owner });
  } catch (err) {
    next(err);
  }
});

/** POST /owners — create user + owner atomically */
router.post(
  "/",
  validate(createOwnerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await createOwner(req.body);
      res.status(201).json({ success: true, data: owner });
    } catch (err) {
      next(err);
    }
  }
);

/** PUT /owners/:id — update owner + user fields */
router.put(
  "/:id",
  validate(updateOwnerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const owner = await updateOwner(req.params.id, req.body);
      res.json({ success: true, data: owner });
    } catch (err) {
      next(err);
    }
  }
);

/** DELETE /owners/:id — deletes owner + cascades to user */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteOwner(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
