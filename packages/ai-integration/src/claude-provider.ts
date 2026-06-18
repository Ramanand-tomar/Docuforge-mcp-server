import Anthropic from "@anthropic-ai/sdk";
import type { IAiProvider } from "./ai-service.js";

export class ClaudeProvider implements IAiProvider {
  private client: Anthropic;
  private model: string;

  constructor(
    apiKey?: string,
    model: string = "claude-sonnet-4-20250514",
  ) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    const systemMessage = context
      ? `You are DocuForge AI, a professional document writing assistant. You generate high-quality, well-structured content.\n\nDocument context:\n${context}`
      : "You are DocuForge AI, a professional document writing assistant. You generate high-quality, well-structured content.";

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemMessage,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock ? textBlock.text : "";
  }
}
