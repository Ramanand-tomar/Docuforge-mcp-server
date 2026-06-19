import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "../.env"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const idx = trimmed.indexOf("=");
    if (idx > 0) process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}

async function main() {
  console.log("🚀 Starting Paper Generation...\n");

  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "tsx",
      resolve(__dirname, "../packages/mcp-server/src/index.ts"),
    ],
    env: process.env as Record<string, string>,
  });

  const client = new Client({
    name: "paper-generator-client",
    version: "0.1.0",
  });

  await client.connect(transport);
  console.log("Connected to DocuForge MCP server\n");

  const title = "Blockchain based Supply Chain Management on Healthcare Products";

  // 1. Create a document
  console.log(`--- Creating Document: ${title} ---`);
  const createResult = await client.callTool({
    name: "create_document",
    arguments: { title, format: "markdown" },
  });
  const createData = JSON.parse(
    (createResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Created:", createData.document_id);
  const docId = createData.document_id;

  // 2. Generate sections using AI
  const sections = [
    { name: "Abstract", prompt: "Write an Abstract for an IEEE research paper on blockchain based supply chain management on healthcare products. Keep it concise, formal, and highlight the main contributions." },
    { name: "I. Introduction", prompt: "Write the Introduction section for an IEEE research paper on blockchain based supply chain management on healthcare products. Discuss the background, problem statement, and motivation." },
    { name: "II. Literature Review", prompt: "Write the Literature Review section for an IEEE research paper on blockchain based supply chain management on healthcare products. Discuss existing solutions and their limitations." },
    { name: "III. Proposed Methodology", prompt: "Write the Proposed Methodology section for an IEEE research paper on blockchain based supply chain management on healthcare products. Detail the architecture, smart contracts, and consensus mechanism." },
    { name: "IV. Results and Discussion", prompt: "Write the Results and Discussion section for an IEEE research paper on blockchain based supply chain management on healthcare products. Discuss security, transparency, and performance improvements." },
    { name: "V. Conclusion", prompt: "Write the Conclusion section for an IEEE research paper on blockchain based supply chain management on healthcare products. Summarize findings and future scope." }
  ];

  for (const sec of sections) {
    console.log(`\n--- Generating Section: ${sec.name} ---`);
    const aiResult = await client.callTool({
      name: "ai_generate_section",
      arguments: {
        document_id: docId,
        section_title: sec.name,
        prompt: sec.prompt,
      },
    });
    
    if (aiResult.isError) {
      console.error(`Failed to generate ${sec.name}:`, aiResult.content);
      continue;
    }

    const rawText = (aiResult.content as Array<{ type: string; text: string }>)[0].text;
    try {
      const aiData = JSON.parse(rawText);
      console.log(`Generated: ${sec.name}`);
    } catch (e) {
      console.error(`Failed to parse AI response: ${rawText}`);
    }
  }

  // 3. Format document
  console.log("\n--- Formatting Document ---");
  const formatResult = await client.callTool({
    name: "format_document",
    arguments: { document_id: docId, style: "academic" },
  });
  const formatData = JSON.parse(
    (formatResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Formatted with style:", formatData.style);

  // 4. Export PDF
  console.log("\n--- Exporting PDF ---");
  const pdfResult = await client.callTool({
    name: "export_pdf",
    arguments: { document_id: docId },
  });
  const pdfData = JSON.parse(
    (pdfResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("PDF Exported to:", pdfData.pdf_path);

  console.log("\n✅ Paper generation complete!");
  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
