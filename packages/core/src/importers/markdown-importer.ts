import { readFile } from "fs/promises";
import type { ImportedDocument } from "./index.js";

export async function importMarkdown(filePath: string): Promise<ImportedDocument> {
  const content = await readFile(filePath, "utf-8");
  const lines = content.split("\n");
  
  let title = "Imported Document";
  const sections: Array<{ title: string; content: string }> = [];
  
  let currentTitle = "Content";
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const h1Match = line.match(/^#\s+(.+)/);
    if (h1Match && title === "Imported Document") {
      title = h1Match[1].trim();
      continue;
    }
    
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (currentContent.length > 0) {
        sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
      }
      currentTitle = h2Match[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  if (currentContent.length > 0) {
    sections.push({ title: currentTitle, content: currentContent.join("\n").trim() });
  }
  
  return { title, sections };
}
