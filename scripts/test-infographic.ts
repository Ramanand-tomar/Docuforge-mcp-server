import { DocumentService, MemoryStorage } from "../packages/core/src/index.js";
import { PdfGenerator, wrapAsInfographicBlock } from "../packages/pdf-engine/src/index.js";

async function main() {
  console.log("🎨 Testing Infographic PDF Rendering...\n");

  const storage = new MemoryStorage();
  const docService = new DocumentService(storage);
  const pdfGenerator = new PdfGenerator(docService, "./output");

  const docId = await docService.createDocument({ title: "Infographic Showcase", format: "markdown" });

  // 1. Process Flow (like the WhatsApp diagram)
  await docService.appendContent({
    documentId: docId,
    section: "How DocuForge Works",
    content: wrapAsInfographicBlock(`<div class="ig-flow-vertical">
  <div class="ig-step ig-blue">
    <div class="ig-step-badge">1</div>
    <div class="ig-icon ig-blue">📝</div>
    <div class="ig-step-content">
      <h4>Create Document</h4>
      <p>Start with a title and choose format: Markdown, LaTeX, or Plain Text</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-green">
    <div class="ig-step-badge">2</div>
    <div class="ig-icon ig-green">🤖</div>
    <div class="ig-step-content">
      <h4>AI Generates Content</h4>
      <p>4 specialized agents write professional content with diagrams</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-orange">
    <div class="ig-step-badge">3</div>
    <div class="ig-icon ig-orange">🎨</div>
    <div class="ig-step-content">
      <h4>Add Visual Diagrams</h4>
      <p>Mermaid diagrams + rich infographics render as visual SVG/HTML</p>
    </div>
  </div>
  <div class="ig-arrow-down">⬇️</div>
  <div class="ig-step ig-purple">
    <div class="ig-step-badge">4</div>
    <div class="ig-icon ig-purple">📄</div>
    <div class="ig-step-content">
      <h4>Export Professional PDF</h4>
      <p>Puppeteer renders everything — diagrams, infographics, styled text</p>
    </div>
  </div>
</div>`) + "\n\n*Figure 1: DocuForge Document Creation Flow*",
  });

  // 2. Stats Row
  await docService.appendContent({
    documentId: docId,
    section: "Key Metrics",
    content: wrapAsInfographicBlock(`<div class="ig-stats">
  <div class="ig-stat">
    <div class="ig-stat-value">37</div>
    <div class="ig-stat-label">MCP Tools</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#2e7d32">4</div>
    <div class="ig-stat-label">AI Agents</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#ef6c00">12</div>
    <div class="ig-stat-label">Diagram Types</div>
  </div>
  <div class="ig-stat">
    <div class="ig-stat-value" style="color:#7b1fa2">16</div>
    <div class="ig-stat-label">Doc Templates</div>
  </div>
</div>`),
  });

  // 3. Feature Grid
  await docService.appendContent({
    documentId: docId,
    section: "Features",
    content: wrapAsInfographicBlock(`<div class="ig-grid">
  <div class="ig-card ig-blue">
    <div class="ig-icon ig-blue" style="margin-bottom:12px">📄</div>
    <h4>Document Creation</h4>
    <p>Markdown, LaTeX, Plain text with structured sections</p>
  </div>
  <div class="ig-card ig-green">
    <div class="ig-icon ig-green" style="margin-bottom:12px">🤖</div>
    <h4>Multi-Agent AI</h4>
    <p>PM, Architect, QA, and Pitch Deck specialized agents</p>
  </div>
  <div class="ig-card ig-orange">
    <div class="ig-icon ig-orange" style="margin-bottom:12px">📊</div>
    <h4>Visual Diagrams</h4>
    <p>Mermaid SVGs + rich HTML infographics in PDFs</p>
  </div>
  <div class="ig-card ig-purple">
    <div class="ig-icon ig-purple" style="margin-bottom:12px">📑</div>
    <h4>PDF Export</h4>
    <p>4 professional themes: academic, resume, report, blog</p>
  </div>
</div>`),
  });

  // 4. Architecture Layers
  await docService.appendContent({
    documentId: docId,
    section: "System Architecture",
    content: wrapAsInfographicBlock(`<div class="ig-layers">
  <div class="ig-layer" style="background:linear-gradient(135deg,#e3f2fd,#bbdefb);color:#0d47a1">
    🖥️ &nbsp; <strong>Client Layer</strong> — Web Dashboard &nbsp;|&nbsp; VS Code &nbsp;|&nbsp; Antigravity &nbsp;|&nbsp; Claude Desktop
  </div>
  <div class="ig-layer-arrow">⬇️ HTTP / stdio / MCP Protocol ⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#fff3e0,#ffe0b2);color:#e65100">
    🔀 &nbsp; <strong>API Layer</strong> — REST API (Express 5) &nbsp;|&nbsp; MCP Server (37 Tools) &nbsp;|&nbsp; JWT Auth
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);color:#1b5e20">
    ⚙️ &nbsp; <strong>Service Layer</strong> — Document Service &nbsp;|&nbsp; AI Agents &nbsp;|&nbsp; Format Service
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#fce4ec,#f8bbd0);color:#880e4f">
    🔧 &nbsp; <strong>Engine Layer</strong> — PDF (Puppeteer) &nbsp;|&nbsp; Diagrams (Mermaid) &nbsp;|&nbsp; Infographics (HTML/CSS)
  </div>
  <div class="ig-layer-arrow">⬇️</div>
  <div class="ig-layer" style="background:linear-gradient(135deg,#f3e5f5,#e1bee7);color:#4a148c">
    💾 &nbsp; <strong>Data Layer</strong> — SQLite &nbsp;|&nbsp; File System
  </div>
</div>`) + "\n\n*Figure 2: DocuForge Architecture*",
  });

  // 5. Comparison
  await docService.appendContent({
    documentId: docId,
    section: "Mermaid vs Infographics",
    content: wrapAsInfographicBlock(`<div class="ig-compare">
  <div class="ig-card ig-blue">
    <h4>📐 Mermaid Diagrams</h4>
    <p>✅ Flowcharts, sequences, ER, Gantt</p>
    <p>✅ Auto-layout by algorithm</p>
    <p>✅ Text-based syntax</p>
    <p>✅ 12 diagram types</p>
    <p>❌ Limited styling</p>
    <p>❌ No custom icons/images</p>
    <p><strong>Best for:</strong> Technical diagrams</p>
  </div>
  <div class="ig-compare-vs">VS</div>
  <div class="ig-card ig-orange">
    <h4>🎨 Infographics</h4>
    <p>✅ Full CSS control</p>
    <p>✅ Icons, gradients, shadows</p>
    <p>✅ Cards, stats, timelines</p>
    <p>✅ Brand-friendly colors</p>
    <p>❌ Manual layout needed</p>
    <p>❌ More verbose HTML</p>
    <p><strong>Best for:</strong> Business/marketing docs</p>
  </div>
</div>`),
  });

  // 6. Callouts
  await docService.appendContent({
    documentId: docId,
    section: "Important Notes",
    content: wrapAsInfographicBlock(`<div class="ig-callout info">
  <div class="ig-callout-icon">💡</div>
  <div>
    <h4>How It Works</h4>
    <p>Infographics are pure HTML/CSS rendered natively by Puppeteer. No external services, no CDN calls, no image generation — just browser-native rendering for pixel-perfect output.</p>
  </div>
</div>
<div class="ig-callout success">
  <div class="ig-callout-icon">✅</div>
  <div>
    <h4>AI-Powered</h4>
    <p>Use <strong>ai_generate_infographic</strong> to describe what you want in plain English. The AI generates the HTML using pre-built CSS classes.</p>
  </div>
</div>
<div class="ig-callout warning">
  <div class="ig-callout-icon">⚠️</div>
  <div>
    <h4>Requirement</h4>
    <p>Set ANTHROPIC_API_KEY to enable AI infographic generation. Template-based infographics work without an API key.</p>
  </div>
</div>`),
  });

  await docService.formatDocument({ documentId: docId, style: "report" });

  console.log("Generating PDF with infographics...");
  const pdfPath = await pdfGenerator.generate(docId);
  console.log(`\n✅ PDF generated: ${pdfPath}`);
  console.log("\n📄 Open to verify:");
  console.log("  1. Process flow — numbered steps with colored badges and icons");
  console.log("  2. Stats row — large numbers with labels");
  console.log("  3. Feature grid — colored cards with gradient icons");
  console.log("  4. Architecture layers — stacked gradient bars");
  console.log("  5. Comparison — side-by-side cards with VS badge");
  console.log("  6. Callouts — colored info/success/warning boxes");

  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
