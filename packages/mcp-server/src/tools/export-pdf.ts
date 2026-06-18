import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ExportPdfSchema, type DocumentService } from "@docuforge/core";

export type PdfExportFn = (documentId: string) => Promise<string>;

export function registerExportPdf(
  server: McpServer,
  docService: DocumentService,
  pdfExport?: PdfExportFn,
) {
  server.tool(
    "export_pdf",
    "Export a document as a PDF file. Returns the file path of the generated PDF.",
    ExportPdfSchema.shape,
    async ({ document_id }) => {
      // Verify document exists
      await docService.getDocument(document_id);

      if (!pdfExport) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error:
                  "PDF engine not available. Install @docuforge/pdf-engine to enable PDF export.",
              }),
            },
          ],
        };
      }

      const pdfPath = await pdfExport(document_id);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { success: true, pdf_path: pdfPath },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
