import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Override the fence renderer to detect mermaid and infographic blocks
const defaultFence =
  md.renderer.rules.fence ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  };

md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const info = token.info ? token.info.trim() : "";
  const infoLower = info.toLowerCase();

  // Render mermaid blocks as special divs (not code blocks)
  if (infoLower === "mermaid") {
    const content = token.content.trim();
    return `<div class="mermaid">${escapeHtml(content)}</div>\n`;
  }

  // Render mermaid diagram shorthand types
  const mermaidTypes = [
    "flowchart", "graph", "sequencediagram", "classdiagram",
    "statediagram", "erdiagram", "gantt", "pie", "mindmap",
    "timeline", "gitgraph", "quadrantchart", "xychart", "block", "sankey",
  ];
  if (mermaidTypes.some((t) => infoLower.startsWith(t))) {
    const content = token.content.trim();
    return `<div class="mermaid">${escapeHtml(info)}\n${escapeHtml(content)}</div>\n`;
  }

  // Render HTML infographic blocks — raw HTML/CSS rendered by Puppeteer
  if (infoLower === "infographic" || infoLower === "html-diagram") {
    const content = token.content.trim();
    return `<div class="infographic-container">${content}</div>\n`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

export function renderMarkdownToHtml(markdown: string): string {
  return md.render(markdown);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
