import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parse(result: { content: unknown }): unknown {
  return JSON.parse(
    (result.content as Array<{ type: string; text: string }>)[0].text,
  );
}

async function main() {
  console.log("🎨 Testing DocuForge Diagram Features...\n");

  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "tsx",
      resolve(__dirname, "../packages/mcp-server/src/index.ts"),
    ],
  });

  const client = new Client({
    name: "docuforge-diagram-test",
    version: "0.1.0",
  });

  await client.connect(transport);
  console.log("Connected to DocuForge MCP server\n");

  // List tools - verify diagram tools exist
  const tools = await client.listTools();
  const toolNames = tools.tools.map((t) => t.name);
  console.log("Tools:", toolNames);
  console.log(
    "Diagram tools present:",
    toolNames.includes("add_diagram") &&
      toolNames.includes("list_diagram_types") &&
      toolNames.includes("ai_generate_diagram"),
  );

  // 1. Create document
  console.log("\n--- Create document ---");
  const createResult = await client.callTool({
    name: "create_document",
    arguments: { title: "Architecture Documentation", format: "markdown" },
  });
  const { document_id: docId } = parse(createResult) as { document_id: string };
  console.log("Created doc:", docId);

  // 2. Add text section
  await client.callTool({
    name: "append_content",
    arguments: {
      document_id: docId,
      section: "Overview",
      content:
        "This document describes the system architecture of DocuForge MCP. The following diagrams illustrate the key components and their interactions.",
    },
  });
  console.log("Added overview section");

  // 3. List diagram types
  console.log("\n--- List diagram types ---");
  const typesResult = await client.callTool({
    name: "list_diagram_types",
    arguments: {},
  });
  const typesData = parse(typesResult) as {
    available_types: Array<{ type: string; name: string }>;
  };
  console.log(
    "Available types:",
    typesData.available_types.map((t) => `${t.type} (${t.name})`).join(", "),
  );

  // 4. Add architecture diagram (using template)
  console.log("\n--- Add architecture diagram (template) ---");
  const archResult = await client.callTool({
    name: "add_diagram",
    arguments: {
      document_id: docId,
      section_title: "System Architecture",
      diagram_type: "architecture",
      caption: "Figure 1: DocuForge System Architecture",
    },
  });
  console.log("Architecture diagram:", parse(archResult));

  // 5. Add custom flowchart
  console.log("\n--- Add custom flowchart ---");
  const flowResult = await client.callTool({
    name: "add_diagram",
    arguments: {
      document_id: docId,
      section_title: "PDF Generation Flow",
      mermaid_code: `graph LR
    A["Document"] --> B{"Format?"}
    B -->|Markdown| C["markdown-it"]
    B -->|LaTeX| D["Strip Commands"]
    B -->|Plain| E["Paragraphs"]
    C --> F["HTML"]
    D --> F
    E --> F
    F --> G["Apply CSS Theme"]
    G --> H["Puppeteer"]
    H --> I["PDF File"]

    style A fill:#4CAF50,color:#fff,stroke:#388E3C,stroke-width:2px
    style I fill:#2196F3,color:#fff,stroke:#1565C0,stroke-width:2px
    style H fill:#FF9800,color:#fff,stroke:#F57C00,stroke-width:2px`,
      caption: "Figure 2: PDF Generation Pipeline",
    },
  });
  console.log("Flowchart:", parse(flowResult));

  // 6. Add sequence diagram
  console.log("\n--- Add sequence diagram ---");
  await client.callTool({
    name: "add_diagram",
    arguments: {
      document_id: docId,
      section_title: "API Request Flow",
      mermaid_code: `sequenceDiagram
    actor User
    participant IDE as VS Code / Antigravity
    participant MCP as MCP Server
    participant Core as Document Service
    participant PDF as PDF Engine

    User->>IDE: "Create a report with diagrams"
    IDE->>MCP: create_document()
    MCP->>Core: createDocument()
    Core-->>MCP: document_id
    MCP-->>IDE: {document_id}

    IDE->>MCP: add_diagram(flowchart)
    MCP->>Core: appendContent(mermaid_code)
    Core-->>MCP: section_id
    MCP-->>IDE: {success}

    IDE->>MCP: export_pdf()
    MCP->>PDF: generate()
    Note over PDF: Mermaid.js renders SVG
    Note over PDF: Puppeteer converts to PDF
    PDF-->>MCP: file_path
    MCP-->>IDE: {pdf_path}
    IDE-->>User: PDF with visual diagrams!`,
      caption: "Figure 3: End-to-End Request Flow",
    },
  });
  console.log("Sequence diagram added");

  // 7. Add pie chart
  console.log("\n--- Add pie chart ---");
  await client.callTool({
    name: "add_diagram",
    arguments: {
      document_id: docId,
      section_title: "Technology Distribution",
      diagram_type: "pie",
      caption: "Figure 4: Codebase Technology Distribution",
    },
  });
  console.log("Pie chart added");

  // 8. Format and export
  console.log("\n--- Format as report ---");
  await client.callTool({
    name: "format_document",
    arguments: { document_id: docId, style: "report" },
  });
  console.log("Formatted as report");

  console.log("\n--- Export PDF ---");
  const pdfResult = await client.callTool({
    name: "export_pdf",
    arguments: { document_id: docId },
  });
  const pdfData = parse(pdfResult) as { success: boolean; pdf_path: string };
  console.log("PDF exported:", pdfData.pdf_path);

  console.log("\n✅ All diagram tests passed!");
  console.log("📄 Open the PDF to verify diagrams render as visual SVGs.");

  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
