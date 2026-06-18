/**
 * Direct test for diagram features - uses relative imports to avoid workspace resolution issues.
 */
import { DocumentService, MemoryStorage } from "../packages/core/src/index.js";
import { PdfGenerator, renderMarkdownToHtml, wrapHtmlWithTemplate, listDiagramTypes, wrapAsMermaidBlock } from "../packages/pdf-engine/src/index.js";

async function main() {
  console.log("🎨 Testing DocuForge Diagram Rendering...\n");

  const storage = new MemoryStorage();
  const docService = new DocumentService(storage);
  const pdfGenerator = new PdfGenerator(docService, "./output");

  // 1. Test markdown renderer detects mermaid blocks
  console.log("--- Test: Mermaid block detection ---");
  const md = "# Title\n\n```mermaid\ngraph TD\n    A-->B\n```\n\n```typescript\nconst x=1;\n```\n";
  const html = renderMarkdownToHtml(md);
  console.log(`  Mermaid <div> found: ${html.includes('<div class="mermaid">')}`);
  console.log(`  Code block preserved: ${html.includes("const x=1")}`);
  console.log(`  Mermaid NOT in <code>: ${!html.includes('<code class="language-mermaid">')}`);

  // 2. Test HTML template includes mermaid.js when diagrams present
  console.log("\n--- Test: HTML template ---");
  const withMermaid = wrapHtmlWithTemplate('<div class="mermaid">graph TD\nA-->B</div>', "Test", "report");
  const withoutMermaid = wrapHtmlWithTemplate("<p>No diagrams</p>", "Test", "report");
  console.log(`  With mermaid: has CDN script = ${withMermaid.includes("mermaid.min.js")}`);
  console.log(`  Without mermaid: no CDN script = ${!withoutMermaid.includes("mermaid.min.js")}`);
  console.log(`  Has diagram CSS = ${withMermaid.includes(".mermaid svg")}`);

  // 3. Test diagram templates
  console.log("\n--- Test: Diagram templates ---");
  const types = listDiagramTypes();
  console.log(`  ${types.length} diagram types available: ${types.map(t => t.type).join(", ")}`);

  // 4. Generate full PDF with multiple diagram types
  console.log("\n--- Test: Full PDF generation with diagrams ---");
  const docId = await docService.createDocument({ title: "Diagram Showcase", format: "markdown" });

  await docService.appendContent({
    documentId: docId,
    section: "Introduction",
    content: "This document showcases professional diagram rendering in DocuForge PDFs.",
  });

  // Architecture diagram
  await docService.appendContent({
    documentId: docId,
    section: "System Architecture",
    content: wrapAsMermaidBlock(`graph TB
    subgraph CLIENT["Client Layer"]
        WEB["Web Dashboard"]
        IDE["VS Code / Antigravity"]
    end
    subgraph SERVER["Server Layer"]
        REST["REST API"]
        MCP["MCP Server"]
    end
    subgraph CORE["Core"]
        DOC["Document Service"]
        PDF["PDF Engine"]
        AI["AI Service"]
    end
    subgraph DATA["Storage"]
        DB[("SQLite")]
        FS["File System"]
    end

    CLIENT --> SERVER
    SERVER --> CORE
    CORE --> DATA

    style CLIENT fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style SERVER fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style CORE fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style DATA fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px`) + "\n\n*Figure 1: System Architecture*",
  });

  // Sequence diagram
  await docService.appendContent({
    documentId: docId,
    section: "Request Flow",
    content: wrapAsMermaidBlock(`sequenceDiagram
    actor User
    participant IDE
    participant MCP as MCP Server
    participant PDF as PDF Engine

    User->>IDE: Create document
    IDE->>MCP: create_document()
    MCP-->>IDE: document_id

    User->>IDE: Add diagram
    IDE->>MCP: add_diagram(flowchart)
    MCP-->>IDE: section_id

    User->>IDE: Export PDF
    IDE->>MCP: export_pdf()
    MCP->>PDF: generate()
    Note over PDF: Mermaid → SVG → PDF
    PDF-->>MCP: file path
    MCP-->>IDE: PDF ready`) + "\n\n*Figure 2: Request Sequence*",
  });

  // Pie chart
  await docService.appendContent({
    documentId: docId,
    section: "Technology Stack",
    content: wrapAsMermaidBlock(`pie title Codebase Composition
    "TypeScript" : 45
    "React" : 15
    "Node.js" : 20
    "Puppeteer" : 10
    "SQLite" : 10`) + "\n\n*Figure 3: Technology Distribution*",
  });

  // Gantt chart
  await docService.appendContent({
    documentId: docId,
    section: "Project Timeline",
    content: wrapAsMermaidBlock(`gantt
    title Development Roadmap
    dateFormat YYYY-MM-DD
    axisFormat %b %d
    section Core
    MCP Server     :done, c1, 2024-01-01, 7d
    PDF Engine     :done, c2, after c1, 5d
    section Features
    AI Tools       :done, f1, after c2, 5d
    Diagrams       :active, f2, after f1, 3d
    PPT Engine     :f3, after f2, 7d`) + "\n\n*Figure 4: Project Timeline*",
  });

  // Flowchart
  await docService.appendContent({
    documentId: docId,
    section: "PDF Pipeline",
    content: wrapAsMermaidBlock(`flowchart LR
    A["Document"] --> B{"Format?"}
    B -->|Markdown| C["markdown-it"]
    B -->|LaTeX| D["Strip LaTeX"]
    B -->|Plain| E["Text → HTML"]
    C --> F["HTML Content"]
    D --> F
    E --> F
    F --> G["Apply CSS Theme"]
    G --> H["Inject Mermaid.js"]
    H --> I["Puppeteer render"]
    I --> J["PDF File"]

    style A fill:#4CAF50,color:#fff,stroke-width:2px
    style J fill:#2196F3,color:#fff,stroke-width:2px
    style I fill:#FF9800,color:#fff,stroke-width:2px
    style H fill:#9C27B0,color:#fff,stroke-width:2px`) + "\n\n*Figure 5: PDF Generation Pipeline*",
  });

  await docService.formatDocument({ documentId: docId, style: "report" });
  console.log("  Document created with 5 diagrams, formatted as report");

  console.log("  Generating PDF (rendering diagrams via Mermaid.js + Puppeteer)...");
  const pdfPath = await pdfGenerator.generate(docId);

  console.log(`\n✅ PDF generated successfully: ${pdfPath}`);
  console.log("\n📄 Open the PDF to verify these render as proper visuals:");
  console.log("  1. Architecture diagram — colored boxes with layered subgraphs");
  console.log("  2. Sequence diagram — actors, arrows, and notes");
  console.log("  3. Pie chart — colored segments with labels");
  console.log("  4. Gantt chart — timeline with progress bars");
  console.log("  5. Flowchart — colored nodes with decision diamonds");

  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
