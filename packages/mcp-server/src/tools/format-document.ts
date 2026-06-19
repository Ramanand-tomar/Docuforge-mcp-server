import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  FormatDocumentSchema,
  type DocumentService,
} from "@docuforge-mcp/core";

export function registerFormatDocument(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "format_document",
    "Apply a style (academic, resume, report, blog, research, ieee) to a document.",
    FormatDocumentSchema.shape,
    async ({ document_id, style }) => {
      const doc = await docService.formatDocument({
        documentId: document_id,
        style,
      });
      const rendered = await docService.renderDocumentContent(doc.id);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                document_id: doc.id,
                style: doc.style,
                formatted_content: rendered,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
