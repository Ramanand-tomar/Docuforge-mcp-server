import type { DocumentStyle } from "@docuforge/core";

const BASE_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { padding: 40px 60px; line-height: 1.6; color: #333; }
  h1 { margin-bottom: 24px; }
  h2 { margin-top: 24px; margin-bottom: 12px; }
  h3 { margin-top: 16px; margin-bottom: 8px; }
  p { margin-bottom: 12px; }
  ul, ol { margin-bottom: 12px; padding-left: 24px; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f4f4f4; padding: 16px; border-radius: 6px; margin-bottom: 12px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin-bottom: 12px; color: #666; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f4f4f4; font-weight: bold; }

  /* Mermaid diagram container styling */
  .mermaid {
    display: flex;
    justify-content: center;
    margin: 24px 0;
    page-break-inside: avoid;
  }
  .mermaid svg {
    max-width: 100%;
    height: auto;
  }
  /* Diagram caption */
  .diagram-caption {
    text-align: center;
    font-style: italic;
    color: #666;
    font-size: 0.9em;
    margin-top: -16px;
    margin-bottom: 16px;
  }
`;

const INFOGRAPHIC_CSS = `
  /* Infographic container */
  .infographic-container {
    margin: 28px 0;
    page-break-inside: avoid;
  }

  /* Reusable infographic building blocks */
  .ig-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 24px;
  }
  .ig-flow-vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
  }
  .ig-step {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 24px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    border: 2px solid #e0e0e0;
    min-width: 200px;
    max-width: 320px;
  }
  .ig-step-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-weight: 800;
    font-size: 18px;
    flex-shrink: 0;
    box-shadow: 0 3px 10px rgba(102,126,234,0.4);
  }
  .ig-step-content h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    color: #333;
  }
  .ig-step-content p {
    margin: 0;
    font-size: 13px;
    color: #666;
    text-indent: 0;
  }
  .ig-arrow {
    font-size: 28px;
    color: #667eea;
    flex-shrink: 0;
  }
  .ig-arrow-down {
    font-size: 28px;
    color: #667eea;
  }

  /* Icon boxes */
  .ig-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    font-size: 28px;
    flex-shrink: 0;
  }

  /* Color variants */
  .ig-blue    { background: #e3f2fd; border-color: #1565c0; }
  .ig-green   { background: #e8f5e9; border-color: #2e7d32; }
  .ig-orange  { background: #fff3e0; border-color: #ef6c00; }
  .ig-red     { background: #fce4ec; border-color: #c62828; }
  .ig-purple  { background: #f3e5f5; border-color: #7b1fa2; }
  .ig-teal    { background: #e0f2f1; border-color: #00695c; }
  .ig-yellow  { background: #fffde7; border-color: #f9a825; }

  .ig-icon.ig-blue    { background: linear-gradient(135deg, #42a5f5, #1565c0); color: #fff; }
  .ig-icon.ig-green   { background: linear-gradient(135deg, #66bb6a, #2e7d32); color: #fff; }
  .ig-icon.ig-orange  { background: linear-gradient(135deg, #ffa726, #ef6c00); color: #fff; }
  .ig-icon.ig-red     { background: linear-gradient(135deg, #ef5350, #c62828); color: #fff; }
  .ig-icon.ig-purple  { background: linear-gradient(135deg, #ab47bc, #7b1fa2); color: #fff; }
  .ig-icon.ig-teal    { background: linear-gradient(135deg, #26a69a, #00695c); color: #fff; }

  /* Grid layout for cards */
  .ig-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    padding: 16px 0;
  }
  .ig-card {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 2px solid #e0e0e0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .ig-card h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
  .ig-card p {
    margin: 0;
    font-size: 13px;
    color: #666;
    text-indent: 0;
  }

  /* Comparison / VS blocks */
  .ig-compare {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 16px;
    align-items: center;
    padding: 16px 0;
  }
  .ig-compare-vs {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f44336;
    color: #fff;
    font-weight: 800;
    font-size: 16px;
  }

  /* Stats row */
  .ig-stats {
    display: flex;
    justify-content: space-around;
    padding: 20px 0;
    gap: 16px;
  }
  .ig-stat {
    text-align: center;
  }
  .ig-stat-value {
    font-size: 32px;
    font-weight: 800;
    color: #1565c0;
    line-height: 1.2;
  }
  .ig-stat-label {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }

  /* Timeline / process */
  .ig-timeline {
    position: relative;
    padding: 16px 0 16px 40px;
  }
  .ig-timeline::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #667eea, #764ba2);
    border-radius: 2px;
  }
  .ig-timeline-item {
    position: relative;
    margin-bottom: 24px;
    padding-left: 24px;
  }
  .ig-timeline-item::before {
    content: '';
    position: absolute;
    left: -27px;
    top: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #667eea;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px #667eea;
  }
  .ig-timeline-item h4 { margin: 0 0 4px 0; font-size: 15px; }
  .ig-timeline-item p { margin: 0; font-size: 13px; color: #666; text-indent: 0; }

  /* Callout box */
  .ig-callout {
    display: flex;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin: 16px 0;
    align-items: flex-start;
  }
  .ig-callout-icon { font-size: 32px; flex-shrink: 0; }
  .ig-callout h4 { margin: 0 0 6px 0; }
  .ig-callout p { margin: 0; font-size: 14px; text-indent: 0; }

  .ig-callout.info { background: #e3f2fd; border-left: 4px solid #1565c0; }
  .ig-callout.success { background: #e8f5e9; border-left: 4px solid #2e7d32; }
  .ig-callout.warning { background: #fff3e0; border-left: 4px solid #ef6c00; }
  .ig-callout.danger { background: #fce4ec; border-left: 4px solid #c62828; }

  /* Architecture layers */
  .ig-layers {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }
  .ig-layer {
    padding: 16px 24px;
    border-radius: 10px;
    text-align: center;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .ig-layer-arrow {
    text-align: center;
    font-size: 20px;
    color: #999;
  }
`;

const DIAGRAM_CSS = `
  /* Professional diagram enhancements */
  .mermaid .node rect,
  .mermaid .node circle,
  .mermaid .node polygon {
    stroke-width: 2px;
  }
  .mermaid .edgePath .path {
    stroke-width: 2px;
  }
  .mermaid text {
    font-size: 14px;
  }
  .mermaid .cluster rect {
    rx: 8px;
    ry: 8px;
  }
`;

const STYLE_CSS: Record<DocumentStyle, string> = {
  academic: `
    body { font-family: 'Times New Roman', Georgia, serif; max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 12px; }
    h2 { font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 6px; }
    p { text-align: justify; text-indent: 2em; }
    p:first-child { text-indent: 0; }
    .mermaid { border: 1px solid #ddd; padding: 16px; border-radius: 4px; background: #fafafa; }
    .diagram-caption { font-family: 'Times New Roman', Georgia, serif; }
  `,
  resume: `
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 750px; margin: 0 auto; padding: 30px 50px; }
    h1 { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 3px solid #2c3e50; padding-bottom: 8px; color: #2c3e50; }
    h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 4px; margin-top: 20px; }
    p { text-indent: 0; font-size: 14px; }
    ul { font-size: 14px; }
    .mermaid { margin: 16px 0; }
  `,
  report: `
    body { font-family: 'Calibri', 'Segoe UI', sans-serif; max-width: 850px; margin: 0 auto; }
    h1 { font-size: 26px; color: #1a5276; border-bottom: 3px solid #1a5276; padding-bottom: 10px; }
    h2 { font-size: 20px; color: #1a5276; margin-top: 28px; }
    h3 { font-size: 16px; color: #2980b9; }
    p { text-indent: 0; }
    .mermaid { border: 2px solid #e8f4f8; padding: 20px; border-radius: 8px; background: linear-gradient(135deg, #f5f9fc 0%, #ffffff 100%); box-shadow: 0 2px 8px rgba(26,82,118,0.08); }
    .diagram-caption { color: #1a5276; font-weight: 500; }
  `,
  blog: `
    body { font-family: 'Georgia', serif; max-width: 720px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 32px; color: #2d3436; margin-bottom: 8px; }
    h2 { font-size: 22px; color: #636e72; }
    p { font-size: 17px; line-height: 1.8; text-indent: 0; }
    blockquote { font-style: italic; border-left-color: #6c5ce7; color: #636e72; }
    .mermaid { border-radius: 12px; padding: 20px; background: #f8f9fa; margin: 28px 0; }
    .diagram-caption { color: #636e72; }
  `,
  research: `
    body { font-family: 'Times New Roman', Georgia, serif; max-width: 780px; margin: 0 auto; padding: 40px 60px; column-count: 2; column-gap: 24px; }
    h1 { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 4px; column-span: all; }
    .authors { text-align: center; font-size: 14px; color: #555; margin-bottom: 4px; column-span: all; }
    .institution { text-align: center; font-size: 13px; color: #777; margin-bottom: 20px; column-span: all; }
    .abstract { border: 1px solid #ccc; padding: 16px 20px; margin: 20px 0; font-size: 13px; column-span: all; }
    .abstract-title { font-weight: bold; text-align: center; margin-bottom: 8px; }
    h2 { font-size: 14px; font-weight: bold; text-transform: uppercase; margin-top: 24px; }
    h3 { font-size: 13px; font-weight: bold; margin-top: 16px; }
    p { text-align: justify; text-indent: 2em; font-size: 13px; line-height: 1.7; }
    p:first-child { text-indent: 0; }
    .references h2 { border-top: 1px solid #333; padding-top: 12px; }
    .references p { text-indent: -2em; padding-left: 2em; font-size: 12px; }
    .toc { margin: 20px 0; padding: 16px; border: 1px solid #ddd; column-span: all; }
    .toc-title { font-weight: bold; margin-bottom: 8px; }
    .toc-entry { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
  `,
  ieee: `
    body { font-family: 'Times New Roman', Times, serif; max-width: 8.5in; margin: 0 auto; padding: 0.5in; column-count: 2; column-gap: 0.25in; line-height: 1.15; font-size: 10pt; }
    h1 { text-align: center; font-size: 24pt; margin-bottom: 8pt; column-span: all; font-weight: normal; }
    .authors { text-align: center; font-size: 11pt; margin-bottom: 12pt; column-span: all; }
    .abstract { border: 1px solid #333; padding: 10pt; margin: 12pt 0; text-align: justify; column-span: all; font-weight: bold; font-size: 9pt; }
    .abstract strong { font-weight: bold; font-style: italic; }
    h2 { font-size: 10pt; font-variant: small-caps; text-align: center; margin-top: 12pt; margin-bottom: 4pt; font-weight: normal; }
    h3 { font-size: 10pt; font-style: italic; margin-top: 8pt; margin-bottom: 4pt; font-weight: normal; }
    p { text-align: justify; text-indent: 0.15in; margin-bottom: 0; }
    p:first-of-type { text-indent: 0; }
    ul, ol, li { text-align: justify; }
    .mermaid, .figure, .table-container { column-span: all; margin: 12pt 0; display: flex; flex-direction: column; align-items: center; background: white; padding: 10pt; border: 1px solid #ddd; }
    .diagram-caption { text-align: center; font-style: italic; color: #333; font-size: 9pt; margin-top: 8pt; }
    .table-caption { text-align: center; font-variant: small-caps; color: #333; font-size: 9pt; margin-bottom: 8pt; }
    .references h2 { border-top: none; }
    .references p { text-indent: -0.25in; padding-left: 0.25in; margin-bottom: 4pt; font-size: 9pt; }
  `,
};

// Mermaid.js CDN + initialization script
const MERMAID_SCRIPT = `
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    themeVariables: {
      fontFamily: 'inherit',
      fontSize: '14px',
      primaryColor: '#4a90d9',
      primaryTextColor: '#fff',
      primaryBorderColor: '#357abd',
      lineColor: '#666',
      secondaryColor: '#f0f4f8',
      tertiaryColor: '#e8f4f8',
      noteBkgColor: '#fff3cd',
      noteTextColor: '#856404',
      noteBorderColor: '#ffc107'
    },
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
      curve: 'basis',
      padding: 15,
      nodeSpacing: 50,
      rankSpacing: 50
    },
    sequence: {
      useMaxWidth: true,
      actorMargin: 80,
      messageMargin: 40,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10
    },
    gantt: {
      useMaxWidth: true,
      titleTopMargin: 25,
      barHeight: 20,
      barGap: 4,
      topPadding: 50,
      sidePadding: 75
    },
    mindmap: {
      useMaxWidth: true,
      padding: 16
    }
  });

  // Signal when all diagrams are rendered
  document.addEventListener('DOMContentLoaded', function() {
    mermaid.run().then(function() {
      document.body.setAttribute('data-mermaid-done', 'true');
    }).catch(function() {
      document.body.setAttribute('data-mermaid-done', 'true');
    });
  });
</script>
`;

export function wrapHtmlWithTemplate(
  htmlContent: string,
  title: string,
  style?: DocumentStyle,
  includeToc: boolean = false
): string {
  const styleCss = style ? STYLE_CSS[style] : "";
  const hasMermaid = htmlContent.includes('class="mermaid"');
  
  let finalHtmlContent = htmlContent;
  if (includeToc) {
    const headings = [...htmlContent.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    if (headings.length > 0) {
      const tocEntries = headings.map((match, i) => {
        return `<div class="toc-entry"><span>${i + 1}. ${match[1]}</span></div>`;
      }).join("\n");
      const tocBlock = `<div class="toc"><div class="toc-title">Table of Contents</div>${tocEntries}</div>`;
      finalHtmlContent = tocBlock + "\n" + finalHtmlContent;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${BASE_CSS}${INFOGRAPHIC_CSS}${DIAGRAM_CSS}${styleCss}</style>
  ${hasMermaid ? MERMAID_SCRIPT : ""}
</head>
<body>
  ${finalHtmlContent}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
