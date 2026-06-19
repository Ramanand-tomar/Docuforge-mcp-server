import { readFile } from "fs/promises";
import type { ImportedDocument } from "./index.js";

export async function importPdf(filePath: string): Promise<ImportedDocument> {
  const dataBuffer = await readFile(filePath);
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  
  const lines = text.split("\n");
  let title = "Imported PDF Document";
  const sections: Array<{ title: string; content: string }> = [];
  
  let currentTitle = "Content";
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Heuristic: line starts with Number.Number or just Number and is short
    if (trimmed.match(/^(\d+(\.\d+)*)\s+[A-Z]/) && trimmed.length < 80 && currentContent.length > 0) {
      sections.push({ title: currentTitle, content: currentContent.join("\n\n").trim() });
      currentTitle = trimmed;
      currentContent = [];
    } else {
      currentContent.push(trimmed);
    }
  }
  
  if (currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n\n").trim() });
  }
  
  return { title, sections };
}
