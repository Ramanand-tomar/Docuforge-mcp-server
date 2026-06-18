import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { DocumentService } from "@docuforge/core";
import type { PdfGenerator } from "@docuforge/pdf-engine";
import type { AiService } from "@docuforge/ai-integration";
import { createDocumentRoutes } from "./routes/documents.js";
import { createPdfRoutes } from "./routes/pdf.js";
import { createAiRoutes } from "./routes/ai.js";
import { createAuthRoutes } from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { generalLimiter, pdfLimiter, aiLimiter } from "./middleware/rate-limit.js";
import { errorHandler } from "./middleware/error-handler.js";
import { config } from "./config.js";

export interface AppDependencies {
  docService: DocumentService;
  pdfGenerator: PdfGenerator;
  aiService?: AiService | null;
}

export function createApp(deps: AppDependencies): express.Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Rate limiting
  app.use("/api/", generalLimiter);

  // Health check (no auth)
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "docuforge",
      version: "0.1.0",
      ai_enabled: !!deps.aiService,
      auth_enabled: config.authEnabled,
    });
  });

  // Auth routes (no auth required)
  app.use("/api/auth", createAuthRoutes());

  // Protected routes
  app.use("/api/documents", authMiddleware);
  app.use("/api/documents", createDocumentRoutes(deps.docService));

  // PDF routes with stricter rate limit
  app.use("/api/documents", pdfLimiter, createPdfRoutes(deps.pdfGenerator));

  // AI routes with AI rate limit
  app.use(
    "/api/documents",
    aiLimiter,
    createAiRoutes(deps.docService, deps.aiService ?? null),
  );

  // Error handler
  app.use(errorHandler);

  return app;
}
