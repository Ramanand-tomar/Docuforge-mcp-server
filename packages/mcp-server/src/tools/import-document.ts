import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import { importMarkdown, importDocx, importPdf } from "@docuforge/core";
import { readFile } from "fs/promises";

export function registerImportDocument(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "import_document",
    "Import an existing document (Markdown, DOCX, PDF, or TXT) into a new DocuForge document.",
    {
      file_path: z.string().describe("Absolute path to the file"),
      format: z.enum(["markdown", "docx", "pdf", "txt"]).describe("File format"),
      title: z.string().optional().describe("Optional override for the document title"),
      document_format: z.enum(["markdown", "latex", "plain"]).default("markdown").describe("Format of the created document"),
    },
    async ({ file_path, format, title, document_format }) => {
      let importedDoc;
      try {
        switch (format) {
          case "markdown":
          case "txt":
            importedDoc = await importMarkdown(file_path);
            break;
          case "docx":
            importedDoc = await importDocx(file_path);
            break;
          case "pdf":
            importedDoc = await importPdf(file_path);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
      } catch (err: any) {
        return {
          content: [{ type: "text", text: `Failed to import document: ${err.message}` }],
        };
      }

      const docTitle = title || importedDoc.title;
      const docId = await docService.createDocument({ title: docTitle, format: document_format });

      for (const section of importedDoc.sections) {
        await docService.appendContent({
          documentId: docId,
          section: section.title,
          content: section.content,
        });
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            document_id: docId,
            title: docTitle,
            sections_imported: importedDoc.sections.length,
            message: "Document imported successfully.",
          }, null, 2)
        }],
      };
    }
  );
}
