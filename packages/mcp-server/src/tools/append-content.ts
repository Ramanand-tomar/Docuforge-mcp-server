import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AppendContentSchema, type DocumentService } from "@docuforge/core";

export function registerAppendContent(
  server: McpServer,
  docService: DocumentService,
) {
  server.tool(
    "append_content",
    "Append a new section to an existing document.",
    AppendContentSchema.shape,
    async ({ document_id, section, content }) => {
      const newSection = await docService.appendContent({
        documentId: document_id,
        section,
        content,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { success: true, section_id: newSection.id },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
