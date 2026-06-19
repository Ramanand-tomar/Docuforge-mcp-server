import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge-mcp/core";
import type { AiService } from "@docuforge-mcp/ai-integration";
import {
  getInfographicTemplate,
  listInfographicTypes,
  wrapAsInfographicBlock,
  type InfographicType,
} from "@docuforge-mcp/pdf-engine";

const AI_INFOGRAPHIC_PROMPT = `You are an expert infographic designer. Generate HTML using ONLY these CSS classes (they are pre-defined, do NOT write any <style> tags):

LAYOUT CLASSES:
- .ig-flow — horizontal flex row with gaps
- .ig-flow-vertical — vertical flex column
- .ig-grid — auto-fit grid (min 220px columns)

STEP/PROCESS:
- .ig-step — card with shadow + rounded corners. Add color class: .ig-blue, .ig-green, .ig-orange, .ig-red, .ig-purple, .ig-teal
- .ig-step-badge — circular numbered badge (gradient purple)
- .ig-step-content — wraps h4 + p inside a step
- .ig-arrow — horizontal arrow (→ emoji, font-size 28px)
- .ig-arrow-down — vertical arrow (⬇️ emoji)

CARDS:
- .ig-card — bordered card with shadow. Add color: .ig-blue, .ig-green, etc.
- .ig-icon — 56px icon box with gradient. Add color class.

STATS:
- .ig-stats — horizontal flex row
- .ig-stat — center-aligned stat block
- .ig-stat-value — large number (font-size 32px, font-weight 800)
- .ig-stat-label — small gray label below

TIMELINE:
- .ig-timeline — vertical timeline with line
- .ig-timeline-item — item with dot, contains h4 + p

LAYERS:
- .ig-layer — full-width rounded bar. Use inline style for gradient colors.
- .ig-layer-arrow — centered arrow text between layers

COMPARISON:
- .ig-compare — 3-column grid (option1 | VS | option2)
- .ig-compare-vs — red circle with "VS"

CALLOUT:
- .ig-callout — flex row with icon + content. Add variant: .info, .success, .warning, .danger
- .ig-callout-icon — large emoji

COLORS: .ig-blue, .ig-green, .ig-orange, .ig-red, .ig-purple, .ig-teal, .ig-yellow

Use Unicode emojis for icons (📤 ⚙️ 🗄️ ✅ 🔒 🚀 💡 ⚠️ etc.)
Output ONLY the HTML — no explanations, no markdown, no code fences.`;

export function registerInfographicTools(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  server.tool(
    "add_infographic",
    "Add a rich visual infographic to a document. These render as professional HTML/CSS graphics in PDFs — with colored cards, numbered steps, icons, stats, timelines, and more. Much richer than Mermaid diagrams.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_title: z.string().min(1).describe("Title for the infographic section"),
      infographic_type: z.enum([
        "process-flow", "comparison", "stats-row",
        "feature-grid", "timeline", "architecture-layers", "callout",
      ]).optional().describe("Type of infographic template. If omitted, custom_html is required."),
      custom_html: z.string().optional().describe("Custom HTML using infographic CSS classes (ig-step, ig-card, ig-grid, etc.)"),
      caption: z.string().optional().describe("Caption below the infographic"),
    },
    async ({ document_id, section_title, infographic_type, custom_html, caption }) => {
      await docService.getDocument(document_id);

      let htmlContent: string;
      if (custom_html) {
        htmlContent = wrapAsInfographicBlock(custom_html);
      } else if (infographic_type) {
        const template = getInfographicTemplate(infographic_type as InfographicType);
        htmlContent = wrapAsInfographicBlock(template.example);
      } else {
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "Either infographic_type or custom_html must be provided." }) }],
        };
      }

      if (caption) {
        htmlContent += `\n\n*${caption}*`;
      }

      const section = await docService.appendContent({
        documentId: document_id,
        section: section_title,
        content: htmlContent,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            section_id: section.id,
            message: "Infographic added. It renders as rich HTML/CSS in exported PDFs.",
          }, null, 2),
        }],
      };
    },
  );

  server.tool(
    "list_infographic_types",
    "List all available infographic types with descriptions.",
    {},
    async () => {
      const types = listInfographicTypes();
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            available_types: types.map((t) => ({ type: t.type, name: t.name, description: t.description })),
            css_classes: {
              layouts: "ig-flow, ig-flow-vertical, ig-grid, ig-compare, ig-layers, ig-timeline, ig-stats",
              components: "ig-step, ig-step-badge, ig-card, ig-icon, ig-stat, ig-callout, ig-timeline-item, ig-layer",
              colors: "ig-blue, ig-green, ig-orange, ig-red, ig-purple, ig-teal, ig-yellow",
              callout_variants: "info, success, warning, danger",
            },
            usage: "Use add_infographic with a type, or ai_generate_infographic for AI-designed visuals.",
          }, null, 2),
        }],
      };
    },
  );

  server.tool(
    "ai_generate_infographic",
    "Use AI to generate a rich visual infographic from a natural language description. Creates professional HTML/CSS graphics with colored cards, numbered steps, icons, stats, and more.",
    {
      document_id: z.string().uuid().describe("Document ID"),
      section_title: z.string().min(1).describe("Section title"),
      description: z.string().min(1).describe("Describe what the infographic should show. Example: 'Show the 5-step user onboarding flow with icons for each step' or 'Display our key metrics: 99.9% uptime, <50ms latency, 10K users'"),
      infographic_type: z.enum([
        "process-flow", "comparison", "stats-row",
        "feature-grid", "timeline", "architecture-layers", "callout",
      ]).optional().describe("Preferred layout type. AI chooses best if omitted."),
      caption: z.string().optional().describe("Caption below the infographic"),
    },
    async ({ document_id, section_title, description, infographic_type, caption }) => {
      if (!aiService) {
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "AI not configured. Set GEMINI_API_KEY." }) }] };
      }

      await docService.getDocument(document_id);

      let typeHint = "";
      if (infographic_type) {
        const template = getInfographicTemplate(infographic_type as InfographicType);
        typeHint = `\n\nUse the "${infographic_type}" layout (${template.description}). Here's an example of the HTML structure:\n${template.example}`;
      }

      const prompt = `Create an infographic for:\n${description}${typeHint}\n\nOutput only the HTML using the pre-defined CSS classes.`;
      const generatedHtml = await aiService.generateSection(prompt, AI_INFOGRAPHIC_PROMPT);

      // Clean response
      let cleaned = generatedHtml.trim();
      if (cleaned.startsWith("```html")) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
      if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      let content = wrapAsInfographicBlock(cleaned);
      if (caption) content += `\n\n*${caption}*`;

      const section = await docService.appendContent({
        documentId: document_id,
        section: section_title,
        content,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            section_id: section.id,
            message: "AI-generated infographic added. Export to PDF to see the visual.",
          }, null, 2),
        }],
      };
    },
  );
}
