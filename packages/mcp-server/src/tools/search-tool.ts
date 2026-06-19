import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";

export function registerSearchTool(server: McpServer, docService: DocumentService) {
  server.tool(
    "search_documents",
    "Full-text search across all documents to find keywords.",
    {
      query: z.string().min(1).describe("Search keyword or phrase"),
      limit: z.number().int().positive().max(50).default(10).describe("Maximum number of results"),
    },
    async ({ query, limit }) => {
      const results = await docService.searchDocuments(query, limit);
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ results, total: results.length }, null, 2) }],
      };
    }
  );
}
