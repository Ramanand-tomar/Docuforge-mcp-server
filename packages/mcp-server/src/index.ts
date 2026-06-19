import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DocumentService, MemoryStorage, SqliteStorage, citationManager } from "@docuforge/core";
import { PdfGenerator } from "@docuforge/pdf-engine";
import { AiService, GeminiProvider } from "@docuforge/ai-integration";
import { registerAllTools } from "./tools/register-all.js";

const storageType = process.env.STORAGE_TYPE || "memory";
const storage = storageType === "sqlite" ? new SqliteStorage() : new MemoryStorage();
citationManager.setStorage(storage);
const docService = new DocumentService(storage);
const pdfGenerator = new PdfGenerator(docService, "./output");

// AI setup (optional - works without API key)
let aiService: AiService | null = null;
if (process.env.GEMINI_API_KEY) {
  const provider = new GeminiProvider(
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_MODEL || undefined,
  );
  aiService = new AiService(provider);
}

const server = new McpServer({
  name: "docuforge-mcp",
  version: "0.1.0",
});

registerAllTools(server, docService, {
  pdfExport: (docId) => pdfGenerator.generate(docId),
  aiService,
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DocuForge MCP server running on stdio");
  if (aiService) {
    console.error("AI integration: enabled");
  } else {
    console.error("AI integration: disabled (set GEMINI_API_KEY to enable)");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
