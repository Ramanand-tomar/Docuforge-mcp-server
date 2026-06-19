import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";
import { exportToDocx, renderMarkdownToHtml, wrapHtmlWithTemplate } from "@docuforge-mcp/pdf-engine";
import { writeFile, mkdir } from "fs/promises";
import * as path from "path";

export function registerExportFormats(
  server: McpServer,
  docService: DocumentService,
  outputDir: string = "./data"
) {
  // Ensure output dir exists
  mkdir(outputDir, { recursive: true }).catch(() => {});

  server.tool(
    "export_docx",
    "Export document to Word (.docx) format.",
    {
      document_id: z.string().uuid().describe("Document ID"),
    },
    async ({ document_id }) => {
      const doc = await docService.getDocument(document_id);
      const file_path = await exportToDocx(doc, outputDir);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, file_path, format: "docx" }) }],
      };
    }
  );

  server.tool(
    "export_html",
    "Export document to HTML format.",
    {
      document_id: z.string().uuid().describe("Document ID"),
    },
    async ({ document_id }) => {
      const doc = await docService.getDocument(document_id);
      const markdown = await docService.renderDocumentContent(document_id);
      const htmlContent = renderMarkdownToHtml(markdown);
      const fullHtml = wrapHtmlWithTemplate(htmlContent, doc.title, doc.style);
      
      const file_path = path.join(outputDir, `${doc.id}.html`);
      await writeFile(file_path, fullHtml);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, file_path, format: "html" }) }],
      };
    }
  );

  server.tool(
    "export_markdown",
    "Export document to Markdown (.md) format.",
    {
      document_id: z.string().uuid().describe("Document ID"),
    },
    async ({ document_id }) => {
      const doc = await docService.getDocument(document_id);
      const markdown = await docService.renderDocumentContent(document_id);
      
      const file_path = path.join(outputDir, `${doc.id}.md`);
      await writeFile(file_path, markdown);

      return {
        content: [{ type: "text" as const, text: JSON.stringify({ success: true, file_path, format: "markdown" }) }],
      };
    }
  );
}
