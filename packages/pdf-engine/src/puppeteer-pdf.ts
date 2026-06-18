import puppeteer, { type Browser } from "puppeteer";

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.connected) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browser;
}

export async function htmlToPdf(
  html: string,
  outputPath: string,
): Promise<void> {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for Mermaid diagrams to render (if any)
    const hasMermaid = html.includes('class="mermaid"');
    if (hasMermaid) {
      await page
        .waitForFunction(
          () => document.body.getAttribute("data-mermaid-done") === "true",
          { timeout: 15000 },
        )
        .catch(() => {
          // If mermaid fails to signal, wait a bit and proceed anyway
          console.error("Mermaid render timeout - proceeding with PDF generation");
        });
      // Small extra delay to ensure SVGs are fully painted
      await new Promise((r) => setTimeout(r, 500));
    }

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
