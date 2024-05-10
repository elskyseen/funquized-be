import expres from "express";
import { createUser, getUsers } from "../controllers/user.js";
import { login, logout, refreshToken } from "../controllers/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = expres.Router();

const genPath = (path) => {
  return `/api/${path}`;
};

router.get(genPath("users"), authMiddleware, getUsers);
router.post(genPath("users"), createUser);
router.post(genPath("login"), login);
router.get(genPath("token"), refreshToken);
router.delete(genPath("logout"), logout);

export default router;
