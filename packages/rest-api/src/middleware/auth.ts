import { SignJWT, jwtVerify } from "jose";
import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

const secret = new TextEncoder().encode(config.jwtSecret);

export async function generateToken(
  userId: string,
  email: string,
): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifyToken(
  token: string,
): Promise<{ userId: string; email: string }> {
  const { payload } = await jwtVerify(token, secret);
  return {
    userId: payload.sub as string,
    email: payload.email as string,
  };
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!config.authEnabled) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  verifyToken(token)
    .then((user) => {
      (req as Request & { user?: { userId: string; email: string } }).user =
        user;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: "Invalid or expired token" });
    });
}
