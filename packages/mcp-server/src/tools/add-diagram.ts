import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";
import {
  getDiagramTemplate,
  listDiagramTypes,
  wrapAsMermaidBlock,
  type DiagramType,
} from "@docuforge-mcp/pdf-engine";

export function registerAddDiagram(
  server: McpServer,
  docService: DocumentService,
) {
  // Tool: add a diagram to a document
  server.tool(
    "add_diagram",
    "Add a professional Mermaid diagram to a document. The diagram will render as a visual SVG in the exported PDF. Provide either a diagram_type to use a template, or custom mermaid_code for a custom diagram.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_title: z
        .string()
        .min(1)
        .describe("Title for the diagram section"),
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
          "Type of diagram template to use. If not provided, mermaid_code is required.",
        ),
      mermaid_code: z
        .string()
        .optional()
        .describe(
          "Custom Mermaid diagram code. If not provided, a template example is used.",
        ),
      caption: z
        .string()
        .optional()
        .describe("Optional caption to display below the diagram"),
    },
    async ({ document_id, section_title, diagram_type, mermaid_code, caption }) => {
      // Verify document exists
      await docService.getDocument(document_id);

      let diagramContent: string;

      if (mermaid_code) {
        diagramContent = wrapAsMermaidBlock(mermaid_code);
      } else if (diagram_type) {
        const template = getDiagramTemplate(diagram_type as DiagramType);
        diagramContent = wrapAsMermaidBlock(template.example);
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error:
                  "Either diagram_type or mermaid_code must be provided.",
              }),
            },
          ],
        };
      }

      // Add caption if provided
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
                message:
                  "Diagram added. It will render as a visual SVG when exported to PDF.",
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool: list available diagram types
  server.tool(
    "list_diagram_types",
    "List all available diagram types with descriptions and examples. Use this to discover what diagram types are available before creating one.",
    {},
    async () => {
      const types = listDiagramTypes();
      const summary = types.map((t) => ({
        type: t.type,
        name: t.name,
        description: t.description,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                available_types: summary,
                usage_hint:
                  "Use add_diagram with a diagram_type to insert a template, or provide custom mermaid_code. Use ai_generate_diagram to have AI create a diagram from a description.",
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
