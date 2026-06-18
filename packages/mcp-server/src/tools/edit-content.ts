import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EditContentSchema, type DocumentService } from "@docuforge/core";

export function registerEditContent(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "edit_content",
    "Edit the content of an existing section in a document.",
    EditContentSchema.shape,
    async ({ document_id, section_id, new_content }) => {
      await docService.editContent({
        documentId: document_id,
        sectionId: section_id,
        newContent: new_content,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true }, null, 2),
          },
        ],
      };
    },
  );
}
