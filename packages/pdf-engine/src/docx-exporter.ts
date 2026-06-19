import { Document as DocxDocument, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import type { Document } from "@docuforge-mcp/core";
import { writeFile } from "fs/promises";
import * as path from "path";

export async function exportToDocx(doc: Document, outputDir: string): Promise<string> {
  const children: Paragraph[] = [];
  
  // Title
  children.push(
    new Paragraph({
      text: doc.title,
      heading: HeadingLevel.TITLE,
    })
  );

  const fontStyle = doc.style === "academic" ? "Times New Roman" : doc.style === "report" ? "Calibri" : "Arial";

  for (const section of doc.sections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
      })
    );

    const lines = section.content.split("\n");
    for (const line of lines) {
      if (line.trim().length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                font: fontStyle,
              }),
            ],
          })
        );
      }
    }
  }

  const docxDoc = new DocxDocument({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(docxDoc);
  const filePath = path.join(outputDir, `${doc.id}.docx`);
  await writeFile(filePath, buffer);

  return filePath;
}
