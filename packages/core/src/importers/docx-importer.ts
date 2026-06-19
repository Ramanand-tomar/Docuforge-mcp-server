import mammoth from "mammoth";
import type { ImportedDocument } from "./index.js";

export async function importDocx(filePath: string): Promise<ImportedDocument> {
  const result = await mammoth.extractRawText({ path: filePath });
  const text = result.value;
  
  const lines = text.split("\n");
  
  let title = "Imported DOCX Document";
  const sections: Array<{ title: string; content: string }> = [];
  
  let currentTitle = "Content";
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Naive heuristic for heading: short line, no trailing punctuation
    if (trimmed.length < 80 && !trimmed.match(/[.,!?:]$/) && currentContent.length > 0) {
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
