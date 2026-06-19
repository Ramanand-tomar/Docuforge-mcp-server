import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CreateDocumentSchema, type DocumentService } from "@docuforge-mcp/core";

export function registerCreateDocument(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "create_document",
    "Create a new document in markdown, latex, or plain format. Returns the document ID.",
    CreateDocumentSchema.shape,
    async ({ title, format }) => {
      const id = await docService.createDocument({ title, format });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ document_id: id, title, format }, null, 2),
          },
        ],
      };
    },
  );
}
