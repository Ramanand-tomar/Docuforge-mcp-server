import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { DocumentService, MemoryStorage, SqliteStorage, citationManager } from "@docuforge-mcp/core";
import { PdfGenerator } from "@docuforge-mcp/pdf-engine";
import { AiService, GeminiProvider } from "@docuforge-mcp/ai-integration";
import { registerAllTools } from "./tools/register-all.js";
import { mkdir } from "fs/promises";

const storageType = process.env.STORAGE_TYPE || "memory";
const sqlitePath = process.env.SQLITE_PATH || "./data/docuforge.db";
const pdfOutputDir = process.env.PDF_OUTPUT_DIR || "./output";
const port = parseInt(process.env.MCP_PORT || "3001", 10);

export function createApp(storage: any, pdfGenerator: any, aiService: any): express.Express {
  const app = express();

  // Security Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  // Health Check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  // API Key Guard
  const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const isProd = process.env.NODE_ENV === "production";
    const configuredKey = process.env.MCP_API_KEY;

    if (isProd && !configuredKey) {
      console.error("FATAL: MCP_API_KEY must be set in production");
      process.exit(1);
    }

    if (configuredKey) {
      const authHeader = req.headers.authorization;
      if (!authHeader || authHeader !== `Bearer ${configuredKey}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }
    next();
  };

  const docService = new DocumentService(storage);

  app.post("/mcp", apiLimiter, requireApiKey, async (req: express.Request, res: express.Response) => {
    const server = new McpServer({
      name: "docuforge-mcp",
      version: "0.1.0",
    });
    registerAllTools(server, docService, {
      pdfExport: (docId) => pdfGenerator.generate(docId),
      aiService,
    });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req as any, res as any, req.body);
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed. Use POST for MCP requests." });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed." });
  });

  return app;
}

async function main() {
  await mkdir("./data", { recursive: true });
  await mkdir(pdfOutputDir, { recursive: true });

  const storage =
    storageType === "sqlite"
      ? new SqliteStorage(sqlitePath)
      : new MemoryStorage();
  
  citationManager.setStorage(storage);
  const docService = new DocumentService(storage);
  const pdfGenerator = new PdfGenerator(docService, pdfOutputDir);

  // AI setup
  let aiService: AiService | null = null;
  if (process.env.GEMINI_API_KEY) {
    const provider = new GeminiProvider(
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL || undefined,
    );
    aiService = new AiService(provider);
  }

  const app = createApp(storage, pdfGenerator, aiService);

  const server = app.listen(port, () => {
    console.log(`DocuForge MCP HTTP server running on http://localhost:${port}/mcp`);
    console.log(`Storage: ${storageType}`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log("Shutting down server gracefully...");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
