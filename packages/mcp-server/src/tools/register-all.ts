import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";
import { registerCreateDocument } from "./create-document.js";
import { registerAppendContent } from "./append-content.js";
import { registerEditContent } from "./edit-content.js";
import { registerFormatDocument } from "./format-document.js";
import { registerExportPdf, type PdfExportFn } from "./export-pdf.js";
import { registerGetDocument } from "./get-document.js";
import { registerAiGenerate } from "./ai-generate.js";
import { registerAiRewrite } from "./ai-rewrite.js";
import { registerAiSummarize } from "./ai-summarize.js";
import { registerAddDiagram } from "./add-diagram.js";
import { registerAiGenerateDiagram } from "./ai-generate-diagram.js";
import { registerAgentTools } from "./agent-tools.js";
import { registerInfographicTools } from "./add-infographic.js";

export interface RegisterToolsOptions {
  pdfExport?: PdfExportFn;
  aiService?: AiService | null;
}

export function registerAllTools(
  server: McpServer,
  docService: DocumentService,
  options: RegisterToolsOptions = {},
) {
  // Document CRUD
  registerCreateDocument(server, docService);
  registerAppendContent(server, docService);
  registerEditContent(server, docService);
  registerFormatDocument(server, docService);
  registerExportPdf(server, docService, options.pdfExport);
  registerGetDocument(server, docService);

  // Diagram tools
  registerAddDiagram(server, docService);
  registerAiGenerateDiagram(server, docService, options.aiService ?? null);

  // AI content tools
  registerAiGenerate(server, docService, options.aiService ?? null);
  registerAiRewrite(server, docService, options.aiService ?? null);
  registerAiSummarize(server, docService, options.aiService ?? null);

  // Infographic tools
  registerInfographicTools(server, docService, options.aiService ?? null);

  // Multi-agent system tools (PM, Architect, QA, Pitch Deck)
  registerAgentTools(server, docService, options.aiService ?? null);
}
