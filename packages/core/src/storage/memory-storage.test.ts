import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStorage } from "./memory-storage.js";

describe("MemoryStorage", () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage();
  });

  it("should create and retrieve a document", async () => {
    const doc = {
      id: "doc-1",
      title: "Test Document",
      format: "markdown" as any,
      style: "academic" as any,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    const docId = await storage.createDocument(doc);

    expect(docId).toBeDefined();
    expect(typeof docId).toBe("string");

    const retrieved = await storage.getDocument(docId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Test Document");
    expect(retrieved?.format).toBe("markdown");
    expect(retrieved?.sections).toEqual([]);
  });

  it("should delete a document", async () => {
    const doc = {
      id: "doc-2",
      title: "To Be Deleted",
      format: "html" as any,
      style: "report" as any,
      sections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    const docId = await storage.createDocument(doc);

    await storage.deleteDocument(docId);

    const retrieved = await storage.getDocument(docId);
    expect(retrieved).toBeNull();
  });

  it("should list documents", async () => {
    await storage.createDocument({ id: "doc-3", title: "Doc 1", format: "markdown" as any, style: "academic" as any, sections: [], createdAt: "", updatedAt: "", version: 1 });
    await storage.createDocument({ id: "doc-4", title: "Doc 2", format: "html" as any, style: "academic" as any, sections: [], createdAt: "", updatedAt: "", version: 1 });

    const list = await storage.listDocuments();
    expect(list.length).toBe(2);
    expect(list.some((d) => d.title === "Doc 1")).toBe(true);
    expect(list.some((d) => d.title === "Doc 2")).toBe(true);
  });
});
