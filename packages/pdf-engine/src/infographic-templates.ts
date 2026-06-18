export type InfographicType =
  | "process-flow"
  | "comparison"
  | "stats-row"
  | "feature-grid"
  | "timeline"
  | "architecture-layers"
  | "callout";

export interface InfographicTemplate {
  type: InfographicType;
  name: string;
  description: string;
  example: string;
}

export const INFOGRAPHIC_TEMPLATES: Record<InfographicType, InfographicTemplate> = {
  "process-flow": {
    type: "process-flow",
    name: "Process Flow",
    description: "Numbered step-by-step process with icons, colored badges, and connecting arrows. Like a WhatsApp service provider flow.",
    example: `<div class="ig-flow-vertical">
  <div class="ig-step ig-blue">
    <div class="ig-step-badge">1</div>
    <div class="ig-icon ig-blue">📤</div>
    <div class="ig-step-content">
      <h4>Send Request</h4>
      <p>User submits data through the client application</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-orange">
    <div class="ig-step-badge">2</div>
    <div class="ig-icon ig-orange">⚙️</div>
    <div class="ig-step-content">
      <h4>Process Data</h4>
      <p>API gateway routes to the correct service handler</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-purple">
    <div class="ig-step-badge">3</div>
    <div class="ig-icon ig-purple">🗄️</div>
    <div class="ig-step-content">
      <h4>Store Result</h4>
      <p>Data is validated and persisted to the database</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-green">
    <div class="ig-step-badge">4</div>
    <div class="ig-icon ig-green">✅</div>
    <div class="ig-step-content">
      <h4>Return Response</h4>
      <p>Confirmation sent back to the user with status</p>
    </div>
  </div>
</div>`,
  },

  comparison: {
    type: "comparison",
    name: "Comparison / VS",
    description: "Side-by-side comparison of two approaches, technologies, or options.",
    example: `<div class="ig-compare">
  <div class="ig-card ig-blue">
    <h4>☁️ Microservices</h4>
    <p><strong>Pros:</strong></p>
    <p>✅ Independent deployment</p>
    <p>✅ Technology flexibility</p>
    <p>✅ Horizontal scaling</p>
    <p>✅ Fault isolation</p>
    <p><strong>Cons:</strong></p>
    <p>❌ Network complexity</p>
    <p>❌ Data consistency challenges</p>
    <p><strong>Best for:</strong> Large teams, complex domains</p>
  </div>
  <div class="ig-compare-vs">VS</div>
  <div class="ig-card ig-green">
    <h4>🏗️ Monolith</h4>
    <p><strong>Pros:</strong></p>
    <p>✅ Simple development</p>
    <p>✅ Easy debugging</p>
    <p>✅ Strong consistency</p>
    <p>✅ Lower overhead</p>
    <p><strong>Cons:</strong></p>
    <p>❌ Scaling limitations</p>
    <p>❌ Deployment risk</p>
    <p><strong>Best for:</strong> Small teams, MVPs</p>
  </div>
</div>`,
  },

  "stats-row": {
    type: "stats-row",
    name: "Statistics Row",
    description: "Key metrics displayed as large numbers with labels. Great for dashboards and executive summaries.",
    example: `<div class="ig-stats">
  <div class="ig-stat">
    <div class="ig-stat-value">99.9%</div>
    <div class="ig-stat-label">Uptime SLA</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#2e7d32">&lt;50ms</div>
    <div class="ig-stat-label">API Latency (p95)</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#ef6c00">10K+</div>
    <div class="ig-stat-label">Requests/sec</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#7b1fa2">5M+</div>
    <div class="ig-stat-label">Documents Generated</div>
  </div>
</div>`,
  },

  "feature-grid": {
    type: "feature-grid",
    name: "Feature Grid",
    description: "Grid of feature cards with icons and descriptions. Great for product overviews.",
    example: `<div class="ig-grid">
  <div class="ig-card ig-blue">
    <div class="ig-icon ig-blue" style="margin-bottom:12px">📄</div>
    <h4>Document Creation</h4>
    <p>Create documents in Markdown, LaTeX, or plain text with structured sections</p>
  </div>
  <div class="ig-card ig-green">
    <div class="ig-icon ig-green" style="margin-bottom:12px">🤖</div>
    <h4>AI Generation</h4>
    <p>AI-powered content generation, rewriting, and summarization via Claude</p>
  </div>
  <div class="ig-card ig-orange">
    <div class="ig-icon ig-orange" style="margin-bottom:12px">📊</div>
    <h4>Visual Diagrams</h4>
    <p>12 diagram types rendered as SVG graphics in PDF exports</p>
  </div>
  <div class="ig-card ig-purple">
    <div class="ig-icon ig-purple" style="margin-bottom:12px">📑</div>
    <h4>PDF Export</h4>
    <p>Professional PDF output with 4 style themes and custom formatting</p>
  </div>
  <div class="ig-card ig-teal">
    <div class="ig-icon ig-teal" style="margin-bottom:12px">🔌</div>
    <h4>MCP Protocol</h4>
    <p>Connect from any IDE — VS Code, Antigravity, Claude Desktop</p>
  </div>
  <div class="ig-card ig-red">
    <div class="ig-icon ig-red" style="margin-bottom:12px">👥</div>
    <h4>Multi-Agent</h4>
    <p>4 specialized AI agents: PM, Architect, QA, Pitch Deck</p>
  </div>
</div>`,
  },

  timeline: {
    type: "timeline",
    name: "Visual Timeline",
    description: "Vertical timeline with colored dots and descriptions. Great for roadmaps and project history.",
    example: `<div class="ig-timeline">
  <div class="ig-timeline-item">
    <h4>Phase 1 — Foundation</h4>
    <p>Core MCP server with 6 tools, document CRUD, in-memory storage</p>
  </div>
  <div class="ig-timeline-item">
    <h4>Phase 2 — PDF Engine</h4>
    <p>Puppeteer-based HTML-to-PDF with 4 style templates</p>
  </div>
  <div class="ig-timeline-item">
    <h4>Phase 3 — Persistence</h4>
    <p>SQLite storage, Express REST API, JWT authentication</p>
  </div>
  <div class="ig-timeline-item">
    <h4>Phase 4 — AI Integration</h4>
    <p>Claude API for content generation, rewriting, summarization</p>
  </div>
  <div class="ig-timeline-item">
    <h4>Phase 5 — Rich Visuals</h4>
    <p>Mermaid diagrams, infographics, multi-agent system with 34 tools</p>
  </div>
</div>`,
  },

  "architecture-layers": {
    type: "architecture-layers",
    name: "Architecture Layers",
    description: "Stacked layer diagram showing system architecture from client to data layer.",
    example: `<div class="ig-layers">
  <div class="ig-layer" style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#0d47a1">
    🖥️ &nbsp; <strong>Client Layer</strong> — Web Dashboard &nbsp;|&nbsp; VS Code Extension &nbsp;|&nbsp; CLI / AI Agents
  </div>
  <div class="ig-layer-arrow">⬇️ HTTP / stdio / MCP ⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);color:#e65100">
    🔀 &nbsp; <strong>API Gateway</strong> — REST API (Express) &nbsp;|&nbsp; MCP Server &nbsp;|&nbsp; Rate Limiting &nbsp;|&nbsp; JWT Auth
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);color:#1b5e20">
    ⚙️ &nbsp; <strong>Service Layer</strong> — Document Service &nbsp;|&nbsp; AI Service &nbsp;|&nbsp; Format Service &nbsp;|&nbsp; Agent System
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#fce4ec,#f8bbd0);color:#880e4f">
    🔧 &nbsp; <strong>Engine Layer</strong> — PDF Engine (Puppeteer) &nbsp;|&nbsp; PPT Engine &nbsp;|&nbsp; Diagram Renderer (Mermaid)
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#f3e5f5,#e1bee7);color:#4a148c">
    💾 &nbsp; <strong>Data Layer</strong> — SQLite &nbsp;|&nbsp; File System &nbsp;|&nbsp; Cache
  </div>
</div>`,
  },

  callout: {
    type: "callout",
    name: "Callout Box",
    description: "Highlighted information box with icon. Use for tips, warnings, important notes.",
    example: `<div class="ig-callout info">
  <div class="ig-callout-icon">💡</div>
  <div>
    <h4>Pro Tip</h4>
    <p>Use the <code>multi_agent_review</code> tool to have all 3 AI agents (PM, Architect, QA) review your document simultaneously for comprehensive feedback.</p>
  </div>
</div>
<div class="ig-callout warning">
  <div class="ig-callout-icon">⚠️</div>
  <div>
    <h4>Important</h4>
    <p>Set <code>ANTHROPIC_API_KEY</code> environment variable to enable AI-powered tools. Without it, only the 6 core document tools will be available.</p>
  </div>
</div>
<div class="ig-callout success">
  <div class="ig-callout-icon">✅</div>
  <div>
    <h4>Ready for Production</h4>
    <p>All infographics render as native HTML/CSS in Puppeteer — no external dependencies, no CDN calls, instant rendering.</p>
  </div>
</div>`,
  },
};

export function getInfographicTemplate(type: InfographicType): InfographicTemplate {
  return INFOGRAPHIC_TEMPLATES[type];
}

export function listInfographicTypes(): InfographicTemplate[] {
  return Object.values(INFOGRAPHIC_TEMPLATES);
}

export function wrapAsInfographicBlock(html: string): string {
  return "```infographic\n" + html.trim() + "\n```";
}
