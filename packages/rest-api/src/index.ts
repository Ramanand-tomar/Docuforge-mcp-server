import { mkdir } from "fs/promises";
import {
  DocumentService,
  MemoryStorage,
  SqliteStorage,
} from "@docuforge/core";
import { PdfGenerator } from "@docuforge/pdf-engine";
import { AiService, ClaudeProvider } from "@docuforge/ai-integration";
import { createApp } from "./app.js";
import { config } from "./config.js";

async function main() {
  await mkdir("./data", { recursive: true });
  await mkdir(config.pdfOutputDir, { recursive: true });

  const storage =
    config.storageType === "sqlite"
      ? new SqliteStorage(config.sqlitePath)
      : new MemoryStorage();

  const docService = new DocumentService(storage);
  const pdfGenerator = new PdfGenerator(docService, config.pdfOutputDir);

  // AI setup (optional)
  let aiService: AiService | null = null;
  if (process.env.ANTHROPIC_API_KEY) {
    const provider = new ClaudeProvider(
      process.env.ANTHROPIC_API_KEY,
      process.env.ANTHROPIC_MODEL || undefined,
    );
    aiService = new AiService(provider);
  }

  const app = createApp({ docService, pdfGenerator, aiService });

  app.listen(config.port, () => {
    console.log(`DocuForge REST API running on http://localhost:${config.port}`);
    console.log(`Storage: ${config.storageType}`);
    console.log(`AI: ${aiService ? "enabled" : "disabled (set ANTHROPIC_API_KEY to enable)"}`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
