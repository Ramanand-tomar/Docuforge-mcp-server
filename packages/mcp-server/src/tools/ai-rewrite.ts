import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";
import { buildDocContext } from "@docuforge/ai-integration";

export function registerAiRewrite(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "ai_rewrite_section",
    "Use AI to rewrite an existing section's content based on instructions.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_id: z.string().uuid().describe("Section ID to rewrite"),
      instructions: z.string().min(1).describe("Instructions for how to rewrite the content"),
    },
    async ({ document_id, section_id, instructions }) => {
      if (!aiService) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error: "AI integration not configured. Set ANTHROPIC_API_KEY environment variable.",
              }),
            },
          ],
        };
      }

      const doc = await docService.getDocument(document_id);
      const section = doc.sections.find((s) => s.id === section_id);
      if (!section) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({ success: false, error: "Section not found" }),
            },
          ],
        };
      }

      const rendered = await docService.renderDocumentContent(document_id);
      const context = buildDocContext(doc, rendered);
      const rewritten = await aiService.rewriteContent(
        section.content,
        instructions,
        context,
      );

      await docService.editContent({
        documentId: document_id,
        sectionId: section_id,
        newContent: rewritten,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, rewritten_length: rewritten.length }, null, 2),
          },
        ],
      };
    },
  );
}
