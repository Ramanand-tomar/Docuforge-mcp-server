import * as vscode from "vscode";
import type { DocuForgeClient } from "../mcp-client.js";

export function registerCreateDocumentCommand(
  context: vscode.ExtensionContext,
  client: DocuForgeClient,
  onRefresh: () => void,
) {
  const command = vscode.commands.registerCommand(
    "docuforge.createDocument",
    async () => {
      const title = await vscode.window.showInputBox({
        prompt: "Document title",
        placeHolder: "My Document",
      });
      if (!title) return;

      const format = await vscode.window.showQuickPick(
        ["markdown", "latex", "plain"],
        { placeHolder: "Select document format" },
      );
      if (!format) return;

      try {
        const result = await client.createDocument(title, format);
        vscode.window.showInformationMessage(
          `Document created: ${title} (${result.document_id})`,
        );
        onRefresh();
      } catch (err) {
        vscode.window.showErrorMessage(
          `Failed to create document: ${(err as Error).message}`,
        );
      }
    },
  );
  context.subscriptions.push(command);
}
