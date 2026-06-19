import type { DocumentStyle } from "./types.js";

export interface StyleTemplate {
  name: DocumentStyle;
  description: string;
  cssClass: string;
  headerFormat: string;
  sectionFormat: string;
}

const STYLE_TEMPLATES: Record<DocumentStyle, StyleTemplate> = {
  academic: {
    name: "academic",
    description: "Formal academic paper with serif fonts and structured sections",
    cssClass: "academic",
    headerFormat: "center",
    sectionFormat: "numbered",
  },
  resume: {
    name: "resume",
    description: "Professional resume with clean layout",
    cssClass: "resume",
    headerFormat: "left",
    sectionFormat: "compact",
  },
  report: {
    name: "report",
    description: "Business report with table of contents",
    cssClass: "report",
    headerFormat: "left",
    sectionFormat: "numbered",
  },
  blog: {
    name: "blog",
    description: "Casual blog post with modern styling",
    cssClass: "blog",
    headerFormat: "left",
    sectionFormat: "plain",
  },
  research: {
    name: "research",
    description: "Academic research paper with two-column layout",
    cssClass: "research",
    headerFormat: "center",
    sectionFormat: "numbered",
  },
  ieee: {
    name: "ieee",
    description: "IEEE formal format with two columns",
    cssClass: "ieee",
    headerFormat: "center",
    sectionFormat: "numbered",
  },
};

export class FormatService {
  getStyleTemplate(style: DocumentStyle): StyleTemplate {
    return STYLE_TEMPLATES[style];
  }

  getAvailableStyles(): StyleTemplate[] {
    return Object.values(STYLE_TEMPLATES);
  }
}
