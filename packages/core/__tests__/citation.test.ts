import { describe, it, expect, beforeEach } from "vitest";
import { DocumentService, MemoryStorage, citationManager } from "../src";

describe("CitationManager and IEEE Formatting", () => {
  let storage: MemoryStorage;
  let docService: DocumentService;

  beforeEach(() => {
    storage = new MemoryStorage();
    docService = new DocumentService(storage);
    citationManager.setStorage(storage);
  });

  it("should create and retrieve citations", async () => {
    const docId = await docService.createDocument({ title: "Test Doc", format: "markdown" });
    
    await citationManager.addCitation({
      documentId: docId,
      type: "article",
      title: "AI in 2024",
      authors: ["John Smith"],
      year: 2024,
    } as any);

    const citations = await citationManager.getCitations(docId);
    expect(citations.length).toBe(1);
    expect(citations[0].title).toBe("AI in 2024");
  });

  it("should resolve inline citations to IEEE format", async () => {
    const docId = await docService.createDocument({ title: "IEEE Doc", format: "markdown" });
    await docService.formatDocument({ documentId: docId, style: "ieee" });
    
    await citationManager.addCitation({
      documentId: docId,
      id: "jones2023",
      type: "article",
      title: "Quantum Computing",
      authors: ["Alice Jones"],
      year: 2023,
    } as any);

    await docService.appendContent({
      documentId: docId,
      section: "Introduction",
      content: "This is a major breakthrough [cite:jones2023].",
    });

    const rendered = await docService.renderDocumentContent(docId);

    // Should resolve to [1]
    expect(rendered).toContain("This is a major breakthrough [1].");
    
    // Should include References section
    expect(rendered).toContain("## References");
    expect(rendered).toContain("<p>[1] A. Jones, \"Quantum Computing,\" 2023.</p>");
  });
});
