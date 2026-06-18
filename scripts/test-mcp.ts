import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log("🚀 Starting DocuForge MCP test...\n");

  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "tsx",
      resolve(__dirname, "../packages/mcp-server/src/index.ts"),
    ],
  });

  const client = new Client({
    name: "docuforge-test-client",
    version: "0.1.0",
  });

  await client.connect(transport);
  console.log("Connected to DocuForge MCP server\n");

  // List available tools
  const tools = await client.listTools();
  console.log(
    "Available tools:",
    tools.tools.map((t) => t.name),
  );
  console.log("");

  // 1. Create a document
  console.log("--- Test: create_document ---");
  const createResult = await client.callTool({
    name: "create_document",
    arguments: { title: "My Test Document", format: "markdown" },
  });
  const createData = JSON.parse(
    (createResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Created:", createData);
  const docId = createData.document_id;

  // 2. Append content
  console.log("\n--- Test: append_content ---");
  const appendResult = await client.callTool({
    name: "append_content",
    arguments: {
      document_id: docId,
      section: "Introduction",
      content:
        "This is the introduction to our test document. It covers important topics.",
    },
  });
  const appendData = JSON.parse(
    (appendResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Appended:", appendData);
  const sectionId = appendData.section_id;

  // Append another section
  await client.callTool({
    name: "append_content",
    arguments: {
      document_id: docId,
      section: "Details",
      content: "Here are the details of the document with more information.",
    },
  });
  console.log("Appended second section");

  // 3. Edit content
  console.log("\n--- Test: edit_content ---");
  const editResult = await client.callTool({
    name: "edit_content",
    arguments: {
      document_id: docId,
      section_id: sectionId,
      new_content:
        "This is the UPDATED introduction with new and improved content.",
    },
  });
  console.log(
    "Edited:",
    JSON.parse(
      (editResult.content as Array<{ type: string; text: string }>)[0].text,
    ),
  );

  // 4. Format document
  console.log("\n--- Test: format_document ---");
  const formatResult = await client.callTool({
    name: "format_document",
    arguments: { document_id: docId, style: "academic" },
  });
  const formatData = JSON.parse(
    (formatResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Formatted with style:", formatData.style);
  console.log("Content preview:", formatData.formatted_content.slice(0, 200));

  // 5. Get document
  console.log("\n--- Test: get_document ---");
  const getResult = await client.callTool({
    name: "get_document",
    arguments: { document_id: docId },
  });
  const getDoc = JSON.parse(
    (getResult.content as Array<{ type: string; text: string }>)[0].text,
  );
  console.log("Document:", {
    id: getDoc.id,
    title: getDoc.title,
    format: getDoc.format,
    style: getDoc.style,
    sections: getDoc.sections.length,
    version: getDoc.version,
  });

  // 6. Export PDF (stub)
  console.log("\n--- Test: export_pdf ---");
  const pdfResult = await client.callTool({
    name: "export_pdf",
    arguments: { document_id: docId },
  });
  console.log(
    "PDF export:",
    JSON.parse(
      (pdfResult.content as Array<{ type: string; text: string }>)[0].text,
    ),
  );

  console.log("\n✅ All tests passed!");
  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
