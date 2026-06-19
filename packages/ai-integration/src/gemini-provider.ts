import { GoogleGenAI } from "@google/genai";
import type { IAiProvider } from "./ai-service.js";

export class GeminiProvider implements IAiProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(
    apiKey?: string,
    model: string = "gemini-2.5-flash",
  ) {
    this.ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
    this.model = model;
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    const systemInstruction = context
      ? `You are DocuForge AI, a professional document writing assistant. You generate high-quality, well-structured content.\n\nDocument context:\n${context}`
      : "You are DocuForge AI, a professional document writing assistant. You generate high-quality, well-structured content.";

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "";
  }
}
