import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";

export function registerVersioningTools(server: McpServer, docService: DocumentService) {
  server.tool(
    "get_document_history",
    "Get the version history of a document",
    {
      document_id: z.string().uuid().describe("Document ID"),
    },
    async ({ document_id }) => {
      const versions = await docService.getDocumentHistory(document_id);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ document_id, versions }, null, 2) }],
      };
    }
  );

  server.tool(
    "restore_version",
    "Restore a document to a previous version",
    {
      document_id: z.string().uuid().describe("Document ID"),
      version: z.number().int().positive().describe("Version to restore"),
    },
    async ({ document_id, version }) => {
      try {
        const doc = await docService.restoreVersion(document_id, version);
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: true, document_id, restored_to_version: version, new_version: doc.version }, null, 2) }],
        };
      } catch (err: any) {
        return {
          content: [{ type: "text" as const, text: `Error: ${err.message}` }],
        };
      }
    }
  );
}
