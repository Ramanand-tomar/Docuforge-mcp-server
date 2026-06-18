import { Router } from "express";
import { randomUUID } from "crypto";
import { generateToken } from "../middleware/auth.js";

// Simple in-memory user store for development
// In production, use the SQLite/PostgreSQL users table
const users = new Map<string, { id: string; email: string; passwordHash: string }>();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createAuthRoutes(): Router {
  const router = Router();

  // Register
  router.post("/register", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }
      if (password.length < 8) {
        res
          .status(400)
          .json({ error: "Password must be at least 8 characters" });
        return;
      }

      // Check if user exists
      for (const user of users.values()) {
        if (user.email === email) {
          res.status(409).json({ error: "User already exists" });
          return;
        }
      }

      const id = randomUUID();
      const passwordHash = await hashPassword(password);
      users.set(id, { id, email, passwordHash });

      const token = await generateToken(id, email);
      res.status(201).json({ user_id: id, token });
    } catch (err) {
      next(err);
    }
  });

  // Login
  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      const passwordHash = await hashPassword(password);
      let foundUser: { id: string; email: string } | null = null;

      for (const user of users.values()) {
        if (user.email === email && user.passwordHash === passwordHash) {
          foundUser = { id: user.id, email: user.email };
          break;
        }
      }

      if (!foundUser) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = await generateToken(foundUser.id, foundUser.email);
      res.json({ user_id: foundUser.id, token });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
