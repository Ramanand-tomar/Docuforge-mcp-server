import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocumentService } from "@docuforge/core";
import {
  type AiService,
  AgentSystem,
  type AgentRole,
  getTemplate,
  listTemplates,
  type TemplateType,
  buildDocContext,
} from "@docuforge/ai-integration";

export function registerAgentTools(
  server: McpServer,
  docService: DocumentService,
  aiService: AiService | null,
) {
  let agentSystem: AgentSystem | null = null;

  function getAgentSystem(): AgentSystem | null {
    if (!aiService) return null;
    if (!agentSystem) {
      agentSystem = new AgentSystem(aiService.provider);
    }
    return agentSystem;
  }

  // ═══════════════════════════════════════════════════
  // META TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "list_agents",
    "List all available AI agents and their specializations.",
    {},
    async () => {
      const agents = [
        { role: "product_manager", name: "Product Manager Agent", specialization: "PRDs, SRS, proposals, requirements, user stories" },
        { role: "architect", name: "System Architect Agent", specialization: "HLD, LLD, system design, architecture diagrams, tech stack selection" },
        { role: "qa_engineer", name: "QA Engineer Agent", specialization: "Test cases, bug reports, edge cases, QA checklists, security testing" },
        { role: "pitch_deck", name: "Pitch Deck Agent", specialization: "Hackathon pitches, investor decks, market analysis, competitive positioning" },
      ];
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ agents, usage: "Use generate_document with the appropriate template_type, or use agent-specific tools like generate_prd, generate_hld, etc." }, null, 2) }],
      };
    },
  );

  server.tool(
    "list_templates",
    "List all available document templates for structured generation.",
    {},
    async () => {
      const templates = listTemplates();
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ templates, usage: "Use generate_document with a template_type and your project description." }, null, 2) }],
      };
    },
  );

  // ═══════════════════════════════════════════════════
  // UNIVERSAL DOCUMENT GENERATOR
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_document",
    "Generate a complete structured document using a specialized AI agent. Supports 16 document types: PRD, SRS, HLD, LLD, test cases, pitch deck, market research, IEEE paper, and more. The document is created with proper formatting, diagrams, and professional structure.",
    {
      title: z.string().min(1).describe("Document title"),
      template_type: z.enum([
        "prd", "srs", "project_proposal", "technical_doc",
        "hld", "lld", "bug_report", "test_cases", "edge_cases",
        "hackathon_pitch", "startup_pitch", "market_research",
        "competitor_analysis", "feasibility_study", "readme", "ieee_paper",
      ]).describe("Type of document to generate"),
      description: z.string().min(1).describe("Detailed description of your project/product/feature. Be specific about what you're building, the tech stack, target audience, and any constraints."),
      format: z.enum(["markdown", "latex", "plain"]).default("markdown").describe("Document format"),
      style: z.enum(["academic", "resume", "report", "blog"]).optional().describe("PDF export style"),
    },
    async ({ title, template_type, description, format, style }) => {
      const system = getAgentSystem();
      if (!system) {
        return { content: [{ type: "text" as const, text: JSON.stringify({ success: false, error: "AI not configured. Set ANTHROPIC_API_KEY." }) }] };
      }

      // Determine which agent to use
      const agentMap: Record<string, AgentRole> = {
        prd: "product_manager", srs: "product_manager", project_proposal: "product_manager",
        technical_doc: "architect", hld: "architect", lld: "architect",
        bug_report: "qa_engineer", test_cases: "qa_engineer", edge_cases: "qa_engineer",
        hackathon_pitch: "pitch_deck", startup_pitch: "pitch_deck",
        market_research: "pitch_deck", competitor_analysis: "pitch_deck",
        feasibility_study: "product_manager", readme: "architect", ieee_paper: "product_manager",
      };

      const agent = agentMap[template_type] || "product_manager";
      const template = getTemplate(template_type as TemplateType);
      const prompt = `${template}\n\n---\nProject/Product Description:\n${description}\n\nDocument Title: ${title}\n\nGenerate the complete document now. Use Mermaid diagram syntax (inside \`\`\`mermaid code blocks) for all diagrams. Be thorough and professional.`;

      const content = await system.runAgent(agent, prompt);

      // Create document and add content as sections
      const docId = await docService.createDocument({ title, format });

      // Split the generated content into sections by ## headings
      const sections = splitIntoSections(content);
      for (const section of sections) {
        await docService.appendContent({
          documentId: docId,
          section: section.title,
          content: section.content,
        });
      }

      if (style) {
        await docService.formatDocument({ documentId: docId, style });
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            document_id: docId,
            title,
            template_type,
            agent_used: agent,
            sections_created: sections.length,
            message: `Document generated by ${agent} agent. Use export_pdf to create a PDF with rendered diagrams.`,
          }, null, 2),
        }],
      };
    },
  );

  // ═══════════════════════════════════════════════════
  // PRODUCT MANAGER AGENT TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_prd",
    "Generate a comprehensive Product Requirements Document (PRD) with user stories, feature prioritization, success metrics, and timeline.",
    {
      product_name: z.string().min(1).describe("Product/feature name"),
      description: z.string().min(1).describe("Detailed product description, target users, and goals"),
      constraints: z.string().optional().describe("Any constraints: budget, timeline, tech stack, team size"),
    },
    async ({ product_name, description, constraints }) => {
      return runAgentTool(getAgentSystem, docService, "product_manager", "prd", product_name, description, constraints, "report");
    },
  );

  server.tool(
    "generate_srs",
    "Generate a Software Requirements Specification (SRS) following IEEE 830 standard with functional requirements, use cases, and data models.",
    {
      system_name: z.string().min(1).describe("System/software name"),
      description: z.string().min(1).describe("System description, functionality, and scope"),
      tech_stack: z.string().optional().describe("Technology stack being used"),
    },
    async ({ system_name, description, tech_stack }) => {
      return runAgentTool(getAgentSystem, docService, "product_manager", "srs", system_name, description, tech_stack ? `Tech Stack: ${tech_stack}` : undefined, "report");
    },
  );

  server.tool(
    "generate_project_proposal",
    "Generate a professional project proposal with objectives, timeline, budget, and risk assessment.",
    {
      project_name: z.string().min(1).describe("Project name"),
      description: z.string().min(1).describe("Project description and objectives"),
      audience: z.string().optional().describe("Who is this proposal for? (investors, management, client)"),
    },
    async ({ project_name, description, audience }) => {
      return runAgentTool(getAgentSystem, docService, "product_manager", "project_proposal", project_name, description, audience ? `Target audience: ${audience}` : undefined, "report");
    },
  );

  // ═══════════════════════════════════════════════════
  // ARCHITECT AGENT TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_hld",
    "Generate a High-Level Design document with architecture diagrams, component overview, data flow, technology selection, and scalability plan.",
    {
      system_name: z.string().min(1).describe("System name"),
      description: z.string().min(1).describe("System requirements and goals"),
      tech_stack: z.string().optional().describe("Preferred or existing tech stack"),
      scale: z.string().optional().describe("Expected scale: users, requests/sec, data volume"),
    },
    async ({ system_name, description, tech_stack, scale }) => {
      const extra = [tech_stack ? `Tech Stack: ${tech_stack}` : "", scale ? `Scale: ${scale}` : ""].filter(Boolean).join("\n");
      return runAgentTool(getAgentSystem, docService, "architect", "hld", system_name, description, extra || undefined, "report");
    },
  );

  server.tool(
    "generate_lld",
    "Generate a Low-Level Design document with class diagrams, sequence diagrams, database schema, API contracts, and implementation details.",
    {
      component_name: z.string().min(1).describe("Component or module name"),
      description: z.string().min(1).describe("Component requirements and interfaces"),
      tech_stack: z.string().optional().describe("Technology stack"),
    },
    async ({ component_name, description, tech_stack }) => {
      return runAgentTool(getAgentSystem, docService, "architect", "lld", component_name, description, tech_stack ? `Tech Stack: ${tech_stack}` : undefined, "report");
    },
  );

  server.tool(
    "generate_system_design",
    "Generate a complete system design document with architecture, API design, database schema, caching, scaling strategy, and deployment plan. Includes multiple Mermaid diagrams.",
    {
      system_name: z.string().min(1).describe("System name"),
      requirements: z.string().min(1).describe("Functional and non-functional requirements"),
      scale: z.string().optional().describe("Expected scale and performance requirements"),
    },
    async ({ system_name, requirements, scale }) => {
      const system = getAgentSystem();
      if (!system) return noAiError();

      const prompt = `Design a complete, scalable system for: ${system_name}

Requirements: ${requirements}
${scale ? `Scale: ${scale}` : ""}

Generate a comprehensive system design document that includes:
1. Architecture overview with a detailed mermaid architecture diagram
2. API design with endpoint specifications
3. Database schema with mermaid ER diagram
4. Data flow with mermaid sequence diagrams
5. Caching strategy
6. Message queue / event-driven patterns
7. Security architecture
8. Scalability plan (horizontal/vertical scaling)
9. Deployment architecture with mermaid deployment diagram
10. Monitoring and alerting strategy
11. Cost estimation

Use Mermaid syntax for ALL diagrams. Be specific with technology choices and justify each decision.`;

      const content = await system.runAgent("architect", prompt);
      const docId = await docService.createDocument({ title: `${system_name} - System Design`, format: "markdown" });
      const sections = splitIntoSections(content);
      for (const s of sections) {
        await docService.appendContent({ documentId: docId, section: s.title, content: s.content });
      }
      await docService.formatDocument({ documentId: docId, style: "report" });

      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, document_id: docId, sections_created: sections.length, agent: "architect" }, null, 2) }] };
    },
  );

  server.tool(
    "generate_tech_doc",
    "Generate comprehensive technical documentation with architecture, API reference, setup guide, and deployment instructions.",
    {
      project_name: z.string().min(1).describe("Project/system name"),
      description: z.string().min(1).describe("What the system does, its components, and tech stack"),
    },
    async ({ project_name, description }) => {
      return runAgentTool(getAgentSystem, docService, "architect", "technical_doc", project_name, description, undefined, "report");
    },
  );

  // ═══════════════════════════════════════════════════
  // QA ENGINEER AGENT TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_test_cases",
    "Generate comprehensive test cases with priorities, preconditions, steps, and expected results. Covers happy path, negative testing, boundary values, security, and performance.",
    {
      feature_name: z.string().min(1).describe("Feature or module to test"),
      description: z.string().min(1).describe("Feature description and acceptance criteria"),
      tech_context: z.string().optional().describe("Technical context: APIs, database, frontend framework"),
    },
    async ({ feature_name, description, tech_context }) => {
      return runAgentTool(getAgentSystem, docService, "qa_engineer", "test_cases", `${feature_name} - Test Cases`, description, tech_context, "report");
    },
  );

  server.tool(
    "generate_bug_reports",
    "Generate structured bug reports from a feature description. Identifies potential bugs with severity, reproduction steps, and workarounds.",
    {
      feature_name: z.string().min(1).describe("Feature or module name"),
      description: z.string().min(1).describe("Feature behavior and known issues"),
      environment: z.string().optional().describe("Environment details: OS, browser, versions"),
    },
    async ({ feature_name, description, environment }) => {
      return runAgentTool(getAgentSystem, docService, "qa_engineer", "bug_report", `${feature_name} - Bug Reports`, description, environment ? `Environment: ${environment}` : undefined, "report");
    },
  );

  server.tool(
    "generate_edge_cases",
    "Perform exhaustive edge case analysis covering input validation, concurrency, security, performance, data handling, and integration points.",
    {
      feature_name: z.string().min(1).describe("Feature or system to analyze"),
      description: z.string().min(1).describe("Feature description and technical context"),
    },
    async ({ feature_name, description }) => {
      return runAgentTool(getAgentSystem, docService, "qa_engineer", "edge_cases", `${feature_name} - Edge Case Analysis`, description, undefined, "report");
    },
  );

  server.tool(
    "generate_qa_checklist",
    "Generate a comprehensive QA checklist for release readiness including functional, security, performance, accessibility, and deployment checks.",
    {
      release_name: z.string().min(1).describe("Release or feature name"),
      description: z.string().min(1).describe("What's being released and its components"),
      release_type: z.enum(["major", "minor", "hotfix"]).optional().describe("Type of release"),
    },
    async ({ release_name, description, release_type }) => {
      const system = getAgentSystem();
      if (!system) return noAiError();

      const prompt = `Generate a comprehensive QA Release Checklist for: ${release_name}
${release_type ? `Release Type: ${release_type}` : ""}

Description: ${description}

Include these checklist categories:
1. Pre-Release Checks
   - [ ] All test cases passing
   - [ ] Code review completed
   - [ ] etc.
2. Functional Testing Checklist
3. Security Testing Checklist
4. Performance Testing Checklist
5. Accessibility Testing Checklist (WCAG 2.1)
6. Cross-Browser/Device Testing
7. API Testing Checklist
8. Database Migration Checklist
9. Deployment Checklist
10. Post-Deployment Verification
11. Rollback Plan

Use markdown checkboxes (- [ ]) for each item. Be thorough and specific.`;

      const content = await system.runAgent("qa_engineer", prompt);
      const docId = await docService.createDocument({ title: `${release_name} - QA Checklist`, format: "markdown" });
      const sections = splitIntoSections(content);
      for (const s of sections) {
        await docService.appendContent({ documentId: docId, section: s.title, content: s.content });
      }

      return { content: [{ type: "text" as const, text: JSON.stringify({ success: true, document_id: docId, sections_created: sections.length, agent: "qa_engineer" }, null, 2) }] };
    },
  );

  // ═══════════════════════════════════════════════════
  // PITCH DECK AGENT TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_hackathon_pitch",
    "Generate a complete hackathon pitch deck with slide-by-slide content, speaker notes, and architecture diagrams.",
    {
      project_name: z.string().min(1).describe("Project name"),
      description: z.string().min(1).describe("What you built, the problem it solves, and tech used"),
      hackathon_name: z.string().optional().describe("Hackathon name"),
      team_members: z.string().optional().describe("Team members and their roles"),
      duration: z.string().optional().describe("How long you had to build (e.g., '24 hours')"),
    },
    async ({ project_name, description, hackathon_name, team_members, duration }) => {
      const extra = [
        hackathon_name ? `Hackathon: ${hackathon_name}` : "",
        team_members ? `Team: ${team_members}` : "",
        duration ? `Build Duration: ${duration}` : "",
      ].filter(Boolean).join("\n");
      return runAgentTool(getAgentSystem, docService, "pitch_deck", "hackathon_pitch", `${project_name} - Hackathon Pitch`, description, extra || undefined, "blog");
    },
  );

  server.tool(
    "generate_startup_pitch",
    "Generate an investor-ready pitch deck (Sequoia format) with market sizing, business model, financials, and competitive analysis.",
    {
      company_name: z.string().min(1).describe("Company/startup name"),
      description: z.string().min(1).describe("Product description, market, and business model"),
      stage: z.enum(["pre-seed", "seed", "series-a", "series-b"]).optional().describe("Funding stage"),
      ask_amount: z.string().optional().describe("Funding amount being raised"),
      traction: z.string().optional().describe("Current traction: users, revenue, growth rate"),
    },
    async ({ company_name, description, stage, ask_amount, traction }) => {
      const extra = [
        stage ? `Stage: ${stage}` : "",
        ask_amount ? `Raising: ${ask_amount}` : "",
        traction ? `Traction: ${traction}` : "",
      ].filter(Boolean).join("\n");
      return runAgentTool(getAgentSystem, docService, "pitch_deck", "startup_pitch", `${company_name} - Pitch Deck`, description, extra || undefined, "blog");
    },
  );

  server.tool(
    "generate_market_research",
    "Generate a comprehensive market research report with market sizing, competitive analysis, SWOT, Porter's Five Forces, and strategic recommendations.",
    {
      market_or_product: z.string().min(1).describe("Market or product to research"),
      description: z.string().min(1).describe("Context about the market/product and what you need to understand"),
    },
    async ({ market_or_product, description }) => {
      return runAgentTool(getAgentSystem, docService, "pitch_deck", "market_research", `${market_or_product} - Market Research`, description, undefined, "report");
    },
  );

  server.tool(
    "generate_competitor_analysis",
    "Generate a detailed competitor analysis with feature comparison, pricing analysis, positioning map, and strategic recommendations.",
    {
      product_name: z.string().min(1).describe("Your product name"),
      description: z.string().min(1).describe("Your product description and known competitors"),
      competitors: z.string().optional().describe("Comma-separated list of competitor names"),
    },
    async ({ product_name, description, competitors }) => {
      return runAgentTool(getAgentSystem, docService, "pitch_deck", "competitor_analysis", `${product_name} - Competitor Analysis`, description, competitors ? `Known competitors: ${competitors}` : undefined, "report");
    },
  );

  // ═══════════════════════════════════════════════════
  // RESEARCH & DOCUMENTATION TOOLS
  // ═══════════════════════════════════════════════════

  server.tool(
    "generate_feasibility_study",
    "Generate a feasibility study covering technical, economic, operational, and schedule feasibility with Go/No-Go recommendation.",
    {
      project_name: z.string().min(1).describe("Project name"),
      description: z.string().min(1).describe("Project description and goals"),
      constraints: z.string().optional().describe("Budget, timeline, and resource constraints"),
    },
    async ({ project_name, description, constraints }) => {
      return runAgentTool(getAgentSystem, docService, "product_manager", "feasibility_study", `${project_name} - Feasibility Study`, description, constraints, "report");
    },
  );

  server.tool(
    "generate_readme",
    "Generate a professional README.md with architecture diagram, setup instructions, API reference, and contributing guide.",
    {
      project_name: z.string().min(1).describe("Project name"),
      description: z.string().min(1).describe("Project description, features, and tech stack"),
    },
    async ({ project_name, description }) => {
      return runAgentTool(getAgentSystem, docService, "architect", "readme", project_name, description, undefined);
    },
  );

  server.tool(
    "generate_ieee_paper",
    "Generate a research paper in IEEE format with abstract, methodology, experimental results, and references.",
    {
      paper_title: z.string().min(1).describe("Paper title"),
      description: z.string().min(1).describe("Research topic, methodology, and key findings"),
      authors: z.string().optional().describe("Author names and affiliations"),
    },
    async ({ paper_title, description, authors }) => {
      return runAgentTool(getAgentSystem, docService, "product_manager", "ieee_paper", paper_title, description, authors ? `Authors: ${authors}` : undefined, "academic");
    },
  );

  // ═══════════════════════════════════════════════════
  // MULTI-AGENT COLLABORATION TOOL
  // ═══════════════════════════════════════════════════

  server.tool(
    "multi_agent_review",
    "Run multiple AI agents on a document for comprehensive review. The PM agent reviews requirements, the Architect reviews technical design, and the QA agent identifies potential issues.",
    {
      document_id: z.string().uuid().describe("Document ID to review"),
    },
    async ({ document_id }) => {
      const system = getAgentSystem();
      if (!system) return noAiError();

      const doc = await docService.getDocument(document_id);
      const rendered = await docService.renderDocumentContent(document_id);
      const context = buildDocContext(doc, rendered);

      const reviews = await system.runMultiAgent([
        {
          role: "product_manager",
          prompt: `Review this document from a Product Manager perspective. Check for: completeness of requirements, clarity of user stories, measurability of success metrics, and overall product viability. List specific improvements.\n\nDocument:\n${rendered}`,
        },
        {
          role: "architect",
          prompt: `Review this document from a System Architect perspective. Check for: technical feasibility, scalability concerns, missing technical details, architecture improvements, and security gaps. List specific improvements.\n\nDocument:\n${rendered}`,
        },
        {
          role: "qa_engineer",
          prompt: `Review this document from a QA perspective. Check for: testability of requirements, missing edge cases, ambiguous specifications, untestable features, and potential failure modes. List specific improvements.\n\nDocument:\n${rendered}`,
        },
      ]);

      // Append review as a new section
      const reviewContent = reviews
        .map((r) => `### ${r.role.replace("_", " ").toUpperCase()} Review\n\n${r.result}`)
        .join("\n\n---\n\n");

      const section = await docService.appendContent({
        documentId: document_id,
        section: "Multi-Agent Review",
        content: reviewContent,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: true,
            document_id,
            review_section_id: section.id,
            agents_used: reviews.map((r) => r.role),
            message: "3 AI agents reviewed the document. Their feedback has been appended as a new section.",
          }, null, 2),
        }],
      };
    },
  );
}

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

function noAiError() {
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({ success: false, error: "AI not configured. Set ANTHROPIC_API_KEY." }),
    }],
  };
}

async function runAgentTool(
  getSystem: () => AgentSystem | null,
  docService: DocumentService,
  agent: AgentRole,
  templateType: string,
  title: string,
  description: string,
  extraContext?: string,
  style?: string,
) {
  const system = getSystem();
  if (!system) return noAiError();

  const template = getTemplate(templateType as TemplateType);
  const prompt = `${template}\n\n---\nProject Description:\n${description}${extraContext ? `\n\n${extraContext}` : ""}\n\nDocument Title: ${title}\n\nGenerate the complete document. Use \`\`\`mermaid code blocks for all diagrams.`;

  const content = await system.runAgent(agent, prompt);
  const docId = await docService.createDocument({ title, format: "markdown" });
  const sections = splitIntoSections(content);
  for (const s of sections) {
    await docService.appendContent({ documentId: docId, section: s.title, content: s.content });
  }
  if (style) {
    await docService.formatDocument({ documentId: docId, style: style as any });
  }

  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({
        success: true,
        document_id: docId,
        title,
        agent_used: agent,
        sections_created: sections.length,
        message: `Use export_pdf to generate a PDF with rendered diagrams.`,
      }, null, 2),
    }],
  };
}

function splitIntoSections(content: string): Array<{ title: string; content: string }> {
  const lines = content.split("\n");
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = "Content";
  let currentContent: string[] = [];

  for (const line of lines) {
    // Match ## headings (H2) as section breaks
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join("\n").trim(),
        });
      }
      currentTitle = h2Match[1].replace(/^[\d.]+\s*/, "").trim(); // Remove numbering
      currentContent = [];
    } else {
      // Skip the top-level # title (H1) - it's already the document title
      if (line.match(/^#\s+/)) continue;
      currentContent.push(line);
    }
  }

  // Push last section
  if (currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join("\n").trim(),
    });
  }

  // If no sections were found, put everything in one section
  if (sections.length === 0) {
    sections.push({ title: "Content", content: content.trim() });
  }

  return sections;
}
