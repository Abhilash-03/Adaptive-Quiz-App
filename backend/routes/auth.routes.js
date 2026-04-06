import { Router } from "express";
import passport from "passport";
import { register, login, logout, getMe, googleCallback } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Local authentication
router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account", // Force account picker on every login
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/google/failure",
  }),
  googleCallback
);

// Google OAuth failure
router.get("/google/failure", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google authentication failed",
  });
});

export default router;
