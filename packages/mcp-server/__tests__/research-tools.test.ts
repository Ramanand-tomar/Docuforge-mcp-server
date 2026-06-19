import { describe, it, expect, beforeEach } from "vitest";
import { DocumentService, MemoryStorage, citationManager } from "@docuforge-mcp/core";
import { registerResearchTools } from "../src/tools/research-tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

describe("Research Tools", () => {
  let storage: MemoryStorage;
  let docService: DocumentService;
  let server: McpServer;

  let tools: Record<string, any> = {};

  beforeEach(() => {
    tools = {};
    storage = new MemoryStorage();
    docService = new DocumentService(storage);
    citationManager.setStorage(storage);
    server = new McpServer({ name: "test", version: "1" });
    server.tool = ((name: string, desc: string, params: any, cb: any) => {
      tools[name] = cb;
    }) as any;
    registerResearchTools(server, docService, null);
  });

  it("should parse BibTeX via import_bibtex", async () => {
    const importTool = tools["import_bibtex"];
    expect(importTool).toBeDefined();

    const docId = await docService.createDocument({ title: "Test", format: "markdown" });
    
    const bibtex = `
@article{test2024,
  title={Testing the MCP Server},
  author={Smith, John and Doe, Jane},
  year={2024},
  journal={Journal of Software}
}
    `;

    const result = await importTool({ document_id: docId, bibtex });
    expect(result.content[0].text).toContain("Imported 1 citations");

    const citations = await citationManager.getCitations(docId);
    expect(citations.length).toBe(1);
    expect(citations[0].title).toBe("Testing the MCP Server");
    expect(citations[0].year).toBe(2024);
  });

  it("should validate IEEE formatting rules via validate_ieee", async () => {
    const validateTool = tools["validate_ieee"];
    
    const docId = await docService.createDocument({ title: "Test", format: "markdown" });
    await docService.formatDocument({ documentId: docId, style: "ieee" });
    
    let result = await validateTool({ document_id: docId });
    // Fails because missing Abstract
    expect(result.content[0].text).toContain("Missing 'Abstract' section");

    // Add Abstract
    await docService.appendContent({ documentId: docId, section: "Abstract", content: "Test Abstract" });
    
    // Add unresolved citation
    await docService.appendContent({ documentId: docId, section: "Intro", content: "Test [cite:missing123]" });
    
    result = await validateTool({ document_id: docId });
    expect(result.content[0].text).toContain("Unresolved citation marker: [cite:missing123]");
  });
});
