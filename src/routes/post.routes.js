import Router from "express";
import { createPostController, deletePostController, editPostController, getPostController, getPostsController } from "../controllers/post.controller.js";
import { validateSchema } from "../middleware/validation.middlewere.js";
import { createPostValidation, editPostValidation } from "../validations/post.validations.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, validateSchema(createPostValidation), createPostController);
router.get("/:id", getPostController);
router.get("/", getPostsController);
router.put("/:id", requireAuth, validateSchema(editPostValidation), editPostController);
router.delete("/:id", requireAuth, deletePostController);


export default router;