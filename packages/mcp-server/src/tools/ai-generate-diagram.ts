import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";
import type { AiService } from "@docuforge-mcp/ai-integration";
import { wrapAsMermaidBlock, DIAGRAM_TEMPLATES } from "@docuforge-mcp/pdf-engine";

const DIAGRAM_PROMPT = `You are a Mermaid diagram expert. Generate a Mermaid diagram based on the user's description.

Rules:
1. Output ONLY valid Mermaid syntax - no markdown fences, no explanations, no comments
2. Use proper Mermaid syntax for the requested diagram type
3. Use descriptive labels for nodes and edges
4. Apply professional styling with colors where appropriate using style directives
5. Keep diagrams readable - not too many nodes (max 15-20 for flowcharts)
6. Use subgraphs to group related items when appropriate
7. For flowcharts, use meaningful shapes: [] for process, {} for decision, () for rounded, [()] for stadium
8. Color scheme suggestions:
   - Blue tones for tech/system: fill:#e3f2fd,stroke:#1565c0
   - Green tones for success/start: fill:#e8f5e9,stroke:#2e7d32
   - Orange tones for warning/decision: fill:#fff3e0,stroke:#ef6c00
   - Red tones for error/end: fill:#fce4ec,stroke:#c62828
   - Purple tones for data/storage: fill:#f3e5f5,stroke:#7b1fa2

Available diagram types and their syntax starters:
${Object.entries(DIAGRAM_TEMPLATES)
  .map(([key, t]) => `- ${key}: ${t.description}`)
  .join("\n")}

Respond with ONLY the mermaid code, nothing else.`;

export function registerAiGenerateDiagram(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "ai_generate_diagram",
    "Use AI to generate a professional Mermaid diagram from a natural language description. The diagram is added to the document and renders as visual SVG in PDF export.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_title: z
        .string()
        .min(1)
        .describe("Title for the diagram section"),
      description: z
        .string()
        .min(1)
        .describe(
          'Natural language description of the diagram to generate. Be specific about what to show. Example: "Show the user authentication flow with login, token validation, and error handling"',
        ),
      diagram_type: z
        .enum([
          "flowchart",
          "sequence",
          "class",
          "state",
          "er",
          "gantt",
          "pie",
          "mindmap",
          "timeline",
          "architecture",
          "git",
          "quadrant",
        ])
        .optional()
        .describe(
          "Preferred diagram type. AI will choose the best type if not specified.",
        ),
      caption: z
        .string()
        .optional()
        .describe("Optional caption to display below the diagram"),
    },
    async ({
      document_id,
      section_title,
      description,
      diagram_type,
      caption,
    }) => {
      if (!aiService) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error:
                  "AI integration not configured. Set GEMINI_API_KEY environment variable.",
              }),
            },
          ],
        };
      }

      await docService.getDocument(document_id);

      let typeHint = "";
      if (diagram_type) {
        const template = DIAGRAM_TEMPLATES[diagram_type];
        typeHint = `\n\nUse a ${diagram_type} diagram (${template.description}). Start with the appropriate mermaid syntax for this type.`;
      }

      const prompt = `${description}${typeHint}`;
      const mermaidCode = await aiService.generateSection(prompt, DIAGRAM_PROMPT);

      // Clean up AI response - strip markdown fences if present
      let cleaned = mermaidCode.trim();
      if (cleaned.startsWith("```mermaid")) {
        cleaned = cleaned.slice("```mermaid".length);
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      let diagramContent = wrapAsMermaidBlock(cleaned);
      if (caption) {
        diagramContent += `\n\n*${caption}*`;
      }

      const section = await docService.appendContent({
        documentId: document_id,
        section: section_title,
        content: diagramContent,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                section_id: section.id,
                diagram_code: cleaned,
                message:
                  "AI-generated diagram added. Export to PDF to see the visual rendering.",
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
