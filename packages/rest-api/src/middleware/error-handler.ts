import type { Request, Response, NextFunction } from "express";
import { DocumentNotFoundError, SectionNotFoundError } from "@docuforge/core";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (
    err instanceof DocumentNotFoundError ||
    err instanceof SectionNotFoundError
  ) {
    res.status(404).json({ error: err.message });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
