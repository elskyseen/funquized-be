import expres from "express";
import {
  createUser,
  getUserProggress,
  getUsers,
  updateUser,
} from "../controllers/user.js";
import {
  googleCallback,
  googleLogin,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { createCategorie, getCategorie } from "../controllers/categorie.js";
import { getChapters } from "../controllers/chapter.js";
import { getChallenge, postChallenge } from "../controllers/challenge.js";

const router = expres.Router();

const genPath = (path) => {
  return `/api/${path}`;
};

router.get(genPath("users"), authMiddleware, getUsers);
router.post(genPath("users"), createUser);
router.patch(genPath("users"), updateUser);

router.post(genPath("login"), login);
router.get(genPath("auth/google"), googleLogin);
router.get(genPath("auth/google/authcallback"), googleCallback);
router.get(genPath("token"), refreshToken);
router.delete(genPath("logout"), logout);

router.get(genPath("categories"), authMiddleware, getCategorie);
router.post(genPath("categories"), createCategorie);

router.get(genPath("chapters"), getChapters);

router.get(genPath("challenges"), getChallenge);
router.post(genPath("challenges"), postChallenge);

router.get(genPath("user_progres"), getUserProggress);

export default router;
