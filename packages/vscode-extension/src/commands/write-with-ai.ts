import * as vscode from "vscode";
import type { DocuForgeClient } from "../mcp-client.js";

export function registerWriteWithAiCommand(
  context: vscode.ExtensionContext,
  client: DocuForgeClient,
  onRefresh: () => void,
) {
  const command = vscode.commands.registerCommand(
    "docuforge.writeWithAi",
    async (docId?: string) => {
      if (!docId) {
        const docs = await client.listDocuments();
        if (docs.length === 0) {
          vscode.window.showWarningMessage("No documents found. Create one first.");
          return;
        }
        const pick = await vscode.window.showQuickPick(
          docs.map((d) => ({ label: d.title, description: d.id, docId: d.id })),
          { placeHolder: "Select document" },
        );
        if (!pick) return;
        docId = pick.docId;
      }

      const sectionTitle = await vscode.window.showInputBox({
        prompt: "Section title",
        placeHolder: "Introduction",
      });
      if (!sectionTitle) return;

      const prompt = await vscode.window.showInputBox({
        prompt: "What should AI write?",
        placeHolder: "Write a compelling introduction about...",
      });
      if (!prompt) return;

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "AI is writing...",
          },
          async () => {
            await client.aiGenerate(docId!, sectionTitle, prompt);
            vscode.window.showInformationMessage(
              `AI generated section "${sectionTitle}"`,
            );
            onRefresh();
          },
        );
      } catch (err) {
        vscode.window.showErrorMessage(
          `AI generation failed: ${(err as Error).message}`,
        );
      }
    },
  );
  context.subscriptions.push(command);
}
