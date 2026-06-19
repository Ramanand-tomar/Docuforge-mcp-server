import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import type { AiService } from "@docuforge/ai-integration";
import { buildDocContext } from "@docuforge/ai-integration";

export function registerAiGenerate(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "ai_generate_section",
    "Use AI to generate content for a new section and append it to the document.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_title: z.string().min(1).describe("Title for the new section"),
      prompt: z.string().min(1).describe("Instructions for what content to generate"),
    },
    async ({ document_id, section_title, prompt }) => {
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

      const doc = await docService.getDocument(document_id);
      const rendered = await docService.renderDocumentContent(document_id);
      const context = buildDocContext(doc, rendered);
      const generatedContent = await aiService.generateSection(prompt, context);

      const section = await docService.appendContent({
        documentId: document_id,
        section: section_title,
        content: generatedContent,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              section_id: section.id,
              generated_length: generatedContent.length,
            }, null, 2),
          },
        ],
      };
    },
  );
}
