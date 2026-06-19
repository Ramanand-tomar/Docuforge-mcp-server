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
  console.log("🚀 Starting IEEE Paper Generation...\n");

  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "tsx",
      resolve(__dirname, "../packages/mcp-server/src/index.ts"),
    ],
    env: process.env as Record<string, string>,
  });

  const client = new Client({
    name: "ieee-paper-client",
    version: "0.1.0",
  });

  await client.connect(transport);
  console.log("Connected to DocuForge MCP server\n");

  // IEEE format requires title and authors. We can simulate authors with a subtitle or in the first section.
  // We'll put authors right below the title using raw HTML in the abstract or by just using standard title and assuming it renders.
  // Wait, DocuForge markdown renderer supports standard elements. Let's just create the document.
  const title = "Blockchain based Supply Chain Management on Healthcare Products";

  console.log(`--- Creating Document: ${title} ---`);
  const createResult = await client.callTool({
    name: "create_document",
    arguments: { title, format: "markdown" },
  });
  
  if (createResult.isError) {
    throw new Error("Failed to create document: " + JSON.stringify(createResult.content));
  }
  
  const createData = JSON.parse(
    (createResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  const docId = createData.document_id;
  console.log("Created:", docId);

  // We append authors first to be rendered right below title.
  await client.callTool({
    name: "append_content",
    arguments: {
      document_id: docId,
      section: "Authors",
      content: "<div class='authors'>First A. Author, Second B. Author, and Third C. Author</div>",
    },
  });

  // Generate sections using AI
  const sections = [
    { 
      name: "Abstract", 
      prompt: "Write a concise abstract for an IEEE paper on blockchain in healthcare supply chain. Start the text exactly with **_Abstract_—** (bold and italic). Follow it immediately with the abstract text." 
    },
    { 
      name: "Index Terms", 
      prompt: "Provide 4-5 index terms for the paper. Start the text exactly with **_Index Terms_—** (bold and italic), followed by comma-separated keywords." 
    },
    { 
      name: "I. INTRODUCTION", 
      prompt: "Write the Introduction section. Discuss the background, problem statement, and motivation for using blockchain in healthcare supply chain." 
    },
    { 
      name: "II. LITERATURE REVIEW", 
      prompt: "Write the Literature Review section discussing existing solutions and their limitations." 
    },
    { 
      name: "III. PROPOSED METHODOLOGY", 
      prompt: "Write the Proposed Methodology section detailing the architecture, smart contracts, and consensus mechanism. You MUST include a Mermaid diagram (e.g., `mermaid graph TD ... `) that illustrates the system architecture or data flow. Ensure the mermaid code block is correctly formatted." 
    },
    { 
      name: "IV. RESULTS AND DISCUSSION", 
      prompt: "Write the Results and Discussion section. Discuss security, transparency, and performance improvements." 
    },
    { 
      name: "V. CONCLUSION", 
      prompt: "Write the Conclusion section. Summarize findings and future scope." 
    }
  ];

  for (const sec of sections) {
    console.log(`\n--- Generating Section: ${sec.name} ---`);
    let aiResult;
    let retries = 3;
    while (retries > 0) {
      aiResult = await client.callTool({
        name: "ai_generate_section",
        arguments: {
          document_id: docId,
          section_title: sec.name,
          prompt: sec.prompt,
        },
      });
      if (aiResult.isError) {
        console.error(`Failed to generate ${sec.name} (Retries left: ${retries - 1}):`, aiResult.content);
        retries--;
        if (retries > 0) await new Promise(r => setTimeout(r, 5000));
        else continue;
      } else {
        break;
      }
    }

    if (aiResult && !aiResult.isError) {
      const rawText = (aiResult.content as Array<{ type: string; text: string }>)[0].text;
      try {
        JSON.parse(rawText);
        console.log(`Generated: ${sec.name}`);
      } catch (e) {
        console.error(`Failed to parse AI response: ${rawText}`);
      }
    }
  }

  // Format document with new 'ieee' style
  console.log("\n--- Formatting Document ---");
  const formatResult = await client.callTool({
    name: "format_document",
    arguments: { document_id: docId, style: "ieee" },
  });
  
  if (formatResult.isError) {
    console.error("Format error:", formatResult.content);
  } else {
    const formatData = JSON.parse(
      (formatResult.content as Array<{ type: string; text: string }>)[0].text,
    );
    console.log("Formatted with style:", formatData.style);
  }

  // Export PDF
  console.log("\n--- Exporting PDF ---");
  const pdfResult = await client.callTool({
    name: "export_pdf",
    arguments: { document_id: docId },
  });
  
  if (pdfResult.isError) {
    console.error("Export error:", pdfResult.content);
  } else {
    const pdfData = JSON.parse(
      (pdfResult.content as Array<{ type: string; text: string }>)[0].text,
    );
    console.log("PDF Exported to:", pdfData.pdf_path);
  }

  console.log("\n✅ IEEE Paper generation complete!");
  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
