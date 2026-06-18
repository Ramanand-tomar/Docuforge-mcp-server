export interface IAiProvider {
  generateContent(prompt: string, context?: string): Promise<string>;
}

export class AiService {
  readonly provider: IAiProvider;
  constructor(provider: IAiProvider) {
    this.provider = provider;
  }

  async generateSection(prompt: string, docContext?: string): Promise<string> {
    return this.provider.generateContent(prompt, docContext);
  }

  async rewriteContent(
    content: string,
    instructions: string,
    docContext?: string,
  ): Promise<string> {
    const prompt = `Rewrite the following content according to these instructions: "${instructions}"\n\nOriginal content:\n${content}`;
    return this.provider.generateContent(prompt, docContext);
  }

  async summarize(content: string): Promise<string> {
    const prompt = `Provide a concise summary of the following document content:\n\n${content}`;
    return this.provider.generateContent(prompt);
  }
}
