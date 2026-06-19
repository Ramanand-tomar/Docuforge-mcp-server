import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetDocumentSchema, type DocumentService } from "@docuforge-mcp/core";

export function registerGetDocument(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "get_document",
    "Retrieve the full content of a document including all sections.",
    GetDocumentSchema.shape,
    async ({ document_id }) => {
      const doc = await docService.getDocument(document_id);
      const rendered = await docService.renderDocumentContent(document_id);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ...doc,
                rendered_content: rendered,
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
