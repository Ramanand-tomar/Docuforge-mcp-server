import type { Document } from "@docuforge/core";

export function buildDocContext(doc: Document, renderedContent: string): string {
  return [
    `Title: ${doc.title}`,
    `Format: ${doc.format}`,
    doc.style ? `Style: ${doc.style}` : "",
    `Sections: ${doc.sections.length}`,
    "",
    "Current content:",
    renderedContent,
  ]
    .filter(Boolean)
    .join("\n");
}

export const SAMPLE_PROMPTS = {
  academic_intro:
    "Write a scholarly introduction for a research paper on machine learning in healthcare. Include context, problem statement, and research objectives.",
  resume_summary:
    "Write a professional summary for a senior software engineer with 8+ years of experience in full-stack development, cloud architecture, and team leadership.",
  blog_post:
    "Write an engaging blog post introduction about the future of AI-powered developer tools and how they are changing software engineering workflows.",
  report_executive_summary:
    "Write an executive summary for a Q4 business report covering revenue growth, key achievements, and strategic initiatives for the upcoming quarter.",
  technical_section:
    "Write a technical architecture overview section describing a microservices-based e-commerce platform with event-driven communication.",
  cover_letter:
    "Write a compelling cover letter opening paragraph for a product manager role at a fast-growing AI startup.",
};
