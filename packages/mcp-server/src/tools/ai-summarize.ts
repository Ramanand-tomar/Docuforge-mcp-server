import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";
import type { AiService } from "@docuforge-mcp/ai-integration";

export function registerAiSummarize(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "ai_summarize",
    "Use AI to generate a summary of the entire document.",
    {
      document_id: z.string().uuid().describe("Document ID"),
    },
    async ({ document_id }) => {
      if (!aiService) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error: "AI integration not configured. Set GEMINI_API_KEY environment variable.",
              }),
            },
          ],
        };
      }

      const rendered = await docService.renderDocumentContent(document_id);
      const summary = await aiService.summarize(rendered);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, summary }, null, 2),
          },
        ],
      };
    },
  );
}
