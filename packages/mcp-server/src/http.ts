import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { DocumentService, MemoryStorage, SqliteStorage } from "@docuforge/core";
import { PdfGenerator } from "@docuforge/pdf-engine";
import { registerAllTools } from "./tools/register-all.js";
import { mkdir } from "fs/promises";

const storageType = process.env.STORAGE_TYPE || "memory";
const sqlitePath = process.env.SQLITE_PATH || "./data/docuforge.db";
const pdfOutputDir = process.env.PDF_OUTPUT_DIR || "./output";
const port = parseInt(process.env.MCP_PORT || "3001", 10);

async function main() {
  await mkdir("./data", { recursive: true });
  await mkdir(pdfOutputDir, { recursive: true });

  const storage =
    storageType === "sqlite"
      ? new SqliteStorage(sqlitePath)
      : new MemoryStorage();
  const docService = new DocumentService(storage);
  const pdfGenerator = new PdfGenerator(docService, pdfOutputDir);

  const app = express();

  app.post("/mcp", async (req, res) => {
    const server = new McpServer({
      name: "docuforge-mcp",
      version: "0.1.0",
    });
    registerAllTools(server, docService, {
      pdfExport: (docId) => pdfGenerator.generate(docId),
    });

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (_req, res) => {
    res.writeHead(405).end(JSON.stringify({ error: "Method not allowed. Use POST for MCP requests." }));
  });

  app.delete("/mcp", async (_req, res) => {
    res.writeHead(405).end(JSON.stringify({ error: "Method not allowed." }));
  });

  app.listen(port, () => {
    console.log(`DocuForge MCP HTTP server running on http://localhost:${port}/mcp`);
    console.log(`Storage: ${storageType}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
